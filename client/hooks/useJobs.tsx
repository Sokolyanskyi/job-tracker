import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/fetchWithAuth';

const API = 'http://localhost:5000/jobs';

export function useJobs() {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const res = await fetchWithAuth(API);
            return res.json();
        },
    });
}

// Client-side filtering
export function filterJobs(jobs: any[], search: string, status: string) {
    let filtered = jobs || [];

    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
            (job) =>
                job.title.toLowerCase().includes(s) ||
                job.company.toLowerCase().includes(s)
        );
    }

    if (status && status !== 'all') {
        filtered = filtered.filter((job) => job.status === status);
    }

    return filtered;
}

export function useAddJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const res = await fetchWithAuth(API, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const res = await fetchWithAuth(`${API}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
        },
        onMutate: async ({ id, status }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['jobs'] });

            // Snapshot previous value
            const previousJobs = queryClient.getQueryData(['jobs']);

            // Optimistically update to the new value
            queryClient.setQueryData(['jobs'], (old: any[]) => {
                if (!old) return old;
                return old.map((job) =>
                    job.id === id ? { ...job, status } : job
                );
            });

            return { previousJobs };
        },
        onError: (err, vars, context) => {
            // If error, roll back to previous value
            if (context?.previousJobs) {
                queryClient.setQueryData(['jobs'], context.previousJobs);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to sync with server
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetchWithAuth(`${API}/${id}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

// NOTES
export function useNotes(jobId: number) {
    return useQuery({
        queryKey: ['notes', jobId],
        queryFn: async () => {
            const res = await fetchWithAuth(`${API}/${jobId}/notes`);
            return res.json();
        },
        enabled: !!jobId,
    });
}

export function useAddNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, content }: { jobId: number; content: string }) => {
            const res = await fetchWithAuth(`${API}/${jobId}/notes`, {
                method: 'POST',
                body: JSON.stringify({ content }),
            });
            return res.json();
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['notes', vars.jobId] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, jobId, content }: { noteId: number; jobId: number; content: string }) => {
            const res = await fetchWithAuth(`${API}/notes/${noteId}`, {
                method: 'PUT',
                body: JSON.stringify({ content }),
            });
            return res.json();
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['notes', vars.jobId] });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ noteId, jobId }: { noteId: number; jobId: number }) => {
            const res = await fetchWithAuth(`${API}/notes/${noteId}`, {
                method: 'DELETE',
            });
            return res.json();
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['notes', vars.jobId] });
        },
    });
}