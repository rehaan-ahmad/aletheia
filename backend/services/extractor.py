from schemas import ExtractionResult, AtomicClaim
from services.gemini import get_gemini_model
from langchain_core.prompts import PromptTemplate
import uuid

def extract_claims(text: str) -> ExtractionResult:
    llm = get_gemini_model(temperature=0.0)
    structured_llm = llm.with_structured_output(ExtractionResult)
    
    prompt = PromptTemplate(
        input_variables=["text"],
        template="""You are an expert fact-checking AI. Your task is to extract verifiable, distinct, and standalone atomic claims from the text.
        Skip subjective statements, opinions, and questions.
        For each claim, provide the original_context snippet verbatim from the text.
        
        Text:
        {text}
        """
    )
    
    chain = prompt | structured_llm
    try:
        result = chain.invoke({"text": text})
        for claim in result.claims:
            if not claim.claim_id:
                claim.claim_id = str(uuid.uuid4())
        return result
    except Exception as e:
        print(f"Claim extraction failed: {e}")
        return ExtractionResult(claims=[], skipped=[], total_found=0)
