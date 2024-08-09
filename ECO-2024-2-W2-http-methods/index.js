document.getElementById('fetch-button').addEventListener('click', fetchData);

async function fetchData() {
	renderLoadingState();
	try {
		const [postsResponse, usersResponse] = await Promise.all([
			fetch('http://localhost:3004/posts'),
			fetch('http://localhost:3004/users'),
		]);
		if (!postsResponse.ok || !usersResponse.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await postsResponse.json();
		const users = await usersResponse.json();

		renderData(data, users);
	} catch (error) {
		renderErrorState();
	}
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Failed to load data</p>';
	console.log('Failed to load data');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}

function renderData(data, users) {
	const container = document.getElementById('data-container');
	container.innerHTML = ''; // Clear previous data

	if (data.length > 0) {
		data.forEach((item) => {
			const user = users.find((u) => u.id === String(item.userId));
			const div = document.createElement('div');
			div.className = 'item';
			div.innerHTML = `
				<h3>${item.title}</h3>
				<p>${item.body}</p>
				<p><strong>Posted by: ${user ? user.username : 'Unknown User'}</strong></p>
       <button data-id="${item.id}" class="delete-button">Delete</button>
			`;
			container.appendChild(div);
		});

		document.querySelectorAll('.delete-button').forEach((button) => {
			button.addEventListener('click', sendLead);
		});
	}
}

async function sendLead(newLead) {
	const postId = newLead.target.getAttribute('data-id');
	const url = `http://localhost:3004/posts/${postId}`;

	const deleteRequest = {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	try {
		const response = await fetch(url, deleteRequest);
		if (!response.ok) {
			throw new Error('Failed to delete post');
		}

		fetchData();
	} catch (error) {
		console.error('Error deleting post:', error);
	}
}

document.getElementById('post-form').addEventListener('submit', createPost);
async function createPost(event) {
	event.preventDefault();
	const userId = document.getElementById('userId').value;
	const title = document.getElementById('title').value;
	const body = document.getElementById('body').value;

	const newPost = {
		userId,
		title,
		body,
	};

	const createRequest = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(newPost),
	};

	try {
		const response = await fetch('http://localhost:3004/posts', createRequest);
		if (!response.ok) {
			throw new Error('Failed to create post');
		}

		// Clear form fields
		document.getElementById('post-form').reset();
		fetchData(); // Refresh the list after creating a new post
	} catch (error) {
		console.error('Error creating post:', error);
	}
}
