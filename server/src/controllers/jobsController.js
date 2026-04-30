let jobs = [];

export const getJobs = (req, res) => {
    const { search = '', status } = req.query;

    let filtered = [...jobs];

    // 🔍 поиск
    if (search) {
        const s = search.toLowerCase();

        filtered = filtered.filter(
            job =>
                job.title.toLowerCase().includes(s) ||
                job.company.toLowerCase().includes(s)
        );
    }

    // 🎯 фильтр по статусу
    if (status && status !== 'all') {
        filtered = filtered.filter(job => job.status === status);
    }

    res.json(filtered);
};

export const createJob = (req, res) => {
    const job = {
        id: Date.now(),
        ...req.body,
        status: 'applied',
    };

    jobs.unshift(job);

    res.json(job);
};
export const updateJob = (req, res) => {
    const id = Number(req.params.id);

    jobs = jobs.map(job =>
        job.id === id ? { ...job, ...req.body } : job
    );

    res.json({ success: true });
};

export const deleteJob = (req, res) => {
    const id = Number(req.params.id);

    jobs = jobs.filter(job => job.id !== id);

    res.json({ success: true });
};