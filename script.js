const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const LIMIT = 10;
let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

const container = document.getElementById('feed-container');
const loader = document.getElementById('loader');

// Helper function to force a minimum delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchPosts = async (page) => {
    try {
        const response = await fetch(`${API_URL}?_page=${page}&_limit=${LIMIT}`);
        if (!response.ok) throw new Error('Network response failed');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
};

const renderPosts = (posts) => {
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${post.id}. ${post.title}</h2>
            <p>${post.body}</p>
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
};

const loadMoreData = async () => {
    if (isLoading || !hasMoreData) return;
    
    isLoading = true;
    loader.classList.add('visible');

    // Run the fetch and the 500ms delay concurrently.
    // It will wait for whichever takes longer, ensuring a minimum 0.5s loading state.
    const [posts] = await Promise.all([
        fetchPosts(currentPage),
        delay(500) 
    ]);
    
    if (posts.length === 0) {
        hasMoreData = false;
        loader.classList.remove('visible');
        return;
    }

    renderPosts(posts);
    currentPage++;
    isLoading = false;
    loader.classList.remove('visible');
};

const observerOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
};

const observerCallback = (entries) => {
    if (entries[0].isIntersecting) {
        loadMoreData();
    }
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    observer.observe(loader);
});