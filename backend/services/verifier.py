import uuid
from typing import TypedDict, List, Literal
from langgraph.graph import StateGraph, END
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from schemas import ClaimVerification, CitationSource, AtomicClaim
from services.gemini import get_gemini_model
from services.tavily import search_tavily
from config import get_settings

settings = get_settings()

class VerificationState(TypedDict):
    claim: AtomicClaim
    search_queries: List[str]
    citations: List[dict]
    iteration: int
    max_iterations: int
    is_confident: bool
    final_verification: ClaimVerification

def retrieve_node(state: VerificationState):
    iteration = state["iteration"]
    claim = state["claim"]
    llm = get_gemini_model(temperature=0.2)
    
    prompt = f"Claim: {claim.claim_text}\nCurrent citations: {len(state.get('citations', []))}\nGenerate exactly 1 Google search query to find evidence for this claim. Return ONLY the search query string."
    res = llm.invoke(prompt)
    query = res.content.strip().strip('"').strip("'")
    
    new_results = search_tavily(query, max_results=3)
    new_citations = state.get("citations", []).copy()
    
    for r in new_results:
        domain = r.get("url", "").lower()
        cred = "low"
        if ".gov" in domain or ".edu" in domain:
            cred = "high"
        elif "reuters" in domain or "apnews" in domain or "bbc" in domain or "nytimes" in domain:
            cred = "high"
        elif "wikipedia" in domain or "news" in domain:
            cred = "medium"
            
        new_citations.append({
            "url": r.get("url"),
            "title": r.get("title", "Source"),
            "snippet": r.get("content", ""),
            "credibility_tier": cred
        })
        
    return {
        "search_queries": state.get("search_queries", []) + [query],
        "citations": new_citations,
        "iteration": iteration + 1
    }

def evaluate_node(state: VerificationState):
    claim = state["claim"]
    citations = state.get("citations", [])
    iteration = state["iteration"]
    
    if iteration >= state["max_iterations"]:
        return {"is_confident": True}
        
    llm = get_gemini_model(temperature=0)
    context = "\n---\n".join([f"Source: {c['url']}\nSnippet: {c['snippet']}" for c in citations])
    
    prompt = f"""You are determining if we have enough evidence to fact-check this claim.
    Claim: {claim.claim_text}
    
    Evidence:
    {context}
    
    Do we have enough conclusive evidence to make a firm judgment (True/False/Partially True)?
    Respond with EXACTLY 'YES' or 'NO'."""
    
    res = llm.invoke(prompt)
    is_conf = "YES" in res.content.upper()
    
    return {"is_confident": is_conf}

class FinalVerdictGeneration(BaseModel):
    verdict: Literal["True", "False", "Partially True", "Unverifiable"]
    confidence_score: float
    justification: str
    reasoning_chain: str
    conflict_detected: bool
    temporal_flag: bool

def generate_report_node(state: VerificationState):
    claim = state["claim"]
    citations = state.get("citations", [])
    
    llm = get_gemini_model()
    structured_llm = llm.with_structured_output(FinalVerdictGeneration)
    
    context = "\n---\n".join([f"Source: {c['url']}\nSnippet: {c['snippet']}" for c in citations])
    
    prompt = f"""Fact-check the following claim using ONLY the provided evidence.
    Claim: {claim.claim_text}
    Context: {claim.original_context}
    
    Evidence:
    {context}
    
    Output a detailed verification schema. If evidence is conflicting, conflict_detected=true."""
    
    try:
        verdict_data = structured_llm.invoke(prompt)
    except Exception as e:
        print("Final verification failed", e)
        verdict_data = FinalVerdictGeneration(
            verdict="Unverifiable",
            confidence_score=0.0,
            justification=f"Error generating verdict: {e}",
            reasoning_chain="",
            conflict_detected=False,
            temporal_flag=False
        )
        
    cite_sources = [CitationSource(**c) for c in citations]
    final_verif = ClaimVerification(
        claim_id=claim.claim_id,
        claim_text=claim.claim_text,
        original_context=claim.original_context,
        verdict=verdict_data.verdict,
        confidence_score=verdict_data.confidence_score,
        justification=verdict_data.justification,
        reasoning_chain=verdict_data.reasoning_chain,
        citations=cite_sources,
        search_queries_used=state.get("search_queries", []),
        conflict_detected=verdict_data.conflict_detected,
        temporal_flag=verdict_data.temporal_flag,
        key_evidence_snippet=None
    )
    
    return {"final_verification": final_verif}

def _route_evaluation(state: VerificationState):
    if state["is_confident"]:
        return "generate_report_node"
    return "retrieve_node"

def build_verifier_graph():
    workflow = StateGraph(VerificationState)
    
    workflow.add_node("retrieve_node", retrieve_node)
    workflow.add_node("evaluate_node", evaluate_node)
    workflow.add_node("generate_report_node", generate_report_node)
    
    workflow.set_entry_point("retrieve_node")
    workflow.add_edge("retrieve_node", "evaluate_node")
    workflow.add_conditional_edges("evaluate_node", _route_evaluation, {
        "generate_report_node": "generate_report_node",
        "retrieve_node": "retrieve_node"
    })
    workflow.add_edge("generate_report_node", END)
    
    return workflow.compile()
