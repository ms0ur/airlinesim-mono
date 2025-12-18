export interface ImportStatus {
    running: boolean;
    step: 'idle' | 'init' | 'fetching_refs' | 'processing' | 'countries' | 'airports' | 'runways' | 'finished' | 'error';
    progress: number;
    total: number;
    message: string;
}
