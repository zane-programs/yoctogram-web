const BASE_URL = import.meta.env.VITE_PROD_API;

const fetchWithAuth = async (url, options = {}, isBlob = false) => {
  const token = localStorage.getItem('token'); // Retrieve token for each call

  // Set default headers and method
  const defaultOptions = {
    headers: {
      // Don't set 'Content-Type' to 'application/json' if the response is a blob
      'Authorization': `Bearer ${token}`
    },
    method: 'GET',
    ...options
  };

  if (!isBlob) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // If the response is expected to be a blob, return it as such
    if (isBlob) {
      return await response.blob();
    }

    // Otherwise, return the JSON-parsed response
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

// Health Check Endpoint
export const apiHealthCheck = async () => {
  return fetchWithAuth('/api/v1/health');
};

// Users API Endpoints
export const fetchCurrentUser = async () => {
  return fetchWithAuth('/api/v1/users/me');
};

export const fetchUserById = async (userId) => {
  return fetchWithAuth(`/api/v1/users/profile/${userId}`);
};

export const generateUploadUrl = async (privacy) => {
  return fetchWithAuth(`/api/v1/images/upload/${privacy}/generate`, { method: 'POST' });
};

// Images API Endpoints
export const uploadImage = async (url, file, fields) => {
  const formData = new FormData();
  Object.entries(fields).map(([key, value]) => formData.append(key, value));
  formData.append('file', file);

  if (url.indexOf('dev') > -1) {
    // development mode
    console.log(url)
    return fetch(BASE_URL + url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // FormData uses its own content type
      },
      isBlob: true
    });
  } else {
    // upload to S3
    return fetch(url, {
      method: 'POST',
      body: formData
    })
  }
};

export const confirmImageUploaded = async (imageId) => {
  return fetchWithAuth(`/api/v1/images/upload/${imageId}/confirm`, { method: 'POST' });
};

export const retrieveImage = async (downloadUrl) => {
  if (downloadUrl.indexOf('dev') > -1) {
    // Indicate that the response should be treated as a blob
    return fetchWithAuth(downloadUrl, {}, true);
  } else {
    return (await fetch(downloadUrl)).blob();
  }
};
// Feed API Endpoints
export const fetchLatestFeed = async (before, after) => {
  return fetchWithAuth(`/api/v1/feed/latest?before=${before}&after=${after}`);
};

export const fetchFeedByUser = async (creator, before, after) => {
  return fetchWithAuth(`/api/v1/feed/by_user/${creator}?before=${before}&after=${after}`);
};
