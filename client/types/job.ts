export type Job = {
    id: number;
    title: string;
    company: string;
    status: 'applied' | 'interview' | 'offer' | 'reject';
};