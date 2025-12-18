export interface ImportStatus {
    running: boolean;
    step: 'idle' | 'countries' | 'airports' | 'runways' | 'finished' | 'error';
    progress: number;
    total: number;
    message: string;
}
