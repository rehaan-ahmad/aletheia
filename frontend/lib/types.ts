export interface VerifyRequest {
  input_text?: string;
  url?: string;
}

export interface ClaimResult {
  claim: string;
  verdict: 'True' | 'False' | 'Partially True' | 'Unverifiable';
  confidence: number;
  reasoning: string;
  sources: string[];
  search_query_used: string;
}

export interface MediaResult {
  image_url: string;
  verdict: 'AI-Generated' | 'Likely AI' | 'Likely Real' | 'Real' | 'Unanalyzable';
  confidence: number;
  artifacts: string[];
}

export interface VerifyResponse {
  claims: ClaimResult[];
  overall_accuracy: number;
  ai_text_score?: number;
  ai_text_reasoning?: string;
  media_results?: MediaResult[];
  article_text_used: string;
  total_claims: number;
  true_count: number;
  false_count: number;
  partial_count: number;
  unverifiable_count: number;
}

export interface AITextResult {
  final_score: number;
  label: string;
  gptzero: {
    score: number;
    label?: string;
    source: string;
  };
  gemini: {
    score: number;
    reasoning: string;
    signals: string[];
    source: string;
  };
}

export type PipelineStage = 'idle' | 'extracting' | 'searching' | 'verifying' | 'ai_detection' | 'media' | 'complete' | 'error';

export interface SSEEvent {
  type: string;
  data: any;
}
