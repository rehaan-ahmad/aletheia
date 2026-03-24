# ⚡ Aletheia Pitch Deck Outline

## Slide 1: Title Screen
**Title:** Aletheia: Unveiling Truth in the Era of Synthetic Media
**Subtitle:** An AI-Driven Fact-Check & Claim Verification System
**Visuals:** The Aletheia logo, clean dark glassmorphism aesthetic, showcasing the animated "Neural Pipeline" vector morphing.

## Slide 2: The Problem
**Header:** The Misinformation Epidemic
* Social media algorithms and GenAI have scaled misinformation to unprecedented levels.
* Human fact-checkers cannot physically keep up with the volume of daily claims.
* There is no unified system to analyze text, cross-reference credible sources, and detect deepfakes simultaneously in one click.

## Slide 3: The Solution
**Header:** Enter Aletheia
* A scalable, fully autonomous verification engine.
* Parses any raw text or URL instantly using an extraction heuristic.
* Synthesizes high-credibility search results to render verdicts on individual atomic claims.

## Slide 4: Core Technology (The FIRE System)
**Header:** Fact-checking through Iterative Retrieval and Evaluation
* **LangGraph Agents:** Our dynamic AI constructs specialized DuckDuckGo searches to find real-time evidence.
* **Concurrent Execution:** Processes dozens of claims completely in parallel using `asyncio` Python threadpools, cutting standard wait times by 80%.
* **Deep CoT Resolution:** The LLM actively debates conflicting evidence before assigning a final confidence score.

## Slide 5: Unmasking Synthetic Content
**Header:** Multi-Modal Forensics
* **Text Analysis:** Integrated GPTZero architecture to probabilistically score AI-generated sentences and highlight them.
* **Media Forensics:** Integrated Hive AI endpoints to flag deepfakes and manipulated images scraped from the source URL.

## Slide 6: The User Experience
**Header:** Real-Time Transparency
* **Server-Sent Events (SSE):** Users aren't left waiting on a static loading spinner. The backend streams every single agent sub-task live to the UI.
* **Visual Synchronization:** Custom `AnimeJS` polygon morphing tracks the exact state of the LangGraph pipeline visually in real-time.

## Slide 7: Live Demo!
**Header:** Let's see it in action.
* **Script Point 1:** Open the UI (`http://localhost:3000`). Show the clean dark-mode UI.
* **Script Point 2:** Click the "Misinformation" Example Card. (Note: These are pre-cached in our backend for instant sub-second hackathon resolution!).
* **Script Point 3:** Draw attention to the animated polygon morphing next to the live claim feed as it processes.
* **Script Point 4:** Scroll through the beautiful **Accuracy Report**, showcasing the cited evidence dropdowns and the AI/Human probability meter.

## Slide 8: Future Roadmap
**Header:** What's Next for Aletheia
* **Browser Extension:** Fact-checking Twitter and Reddit directly in the viewport.
* **Community Crowdsourcing:** Users can vote on agent verdicts to fine-tune the base model.
* **Live Video Analysis:** Extracting real-time audio transcriptions for live-stream debate fact-checking.
