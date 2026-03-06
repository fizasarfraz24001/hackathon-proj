// src/lib/apiService.js
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Get the current user's ID token
 */
const getIdToken = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    // Force refresh to avoid stale/expired token 401 responses.
    return currentUser.getIdToken(true);
  }

  const resolvedUser = await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('User not authenticated'));
    }, 5000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timeoutId);
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not authenticated'));
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        unsubscribe();
        reject(error);
      }
    );
  });

  return resolvedUser.getIdToken(true);
};

const fetchWithAuth = async (url, options = {}) => {
  const makeRequest = async () => {
    const token = await getIdToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  let response = await makeRequest();
  if (response.status === 401) {
    // Single retry with a freshly resolved token for transient auth failures.
    response = await makeRequest();
  }
  return response;
};

/**
 * Submit assessment to backend
 */
export const submitAssessment = async (assessmentData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/assessment`, {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

export const getFullRecommendations = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching full recommendations:', error);
    throw error;
  }
};

/**
 * Get latest assessment for logged-in user
 */
export const getLatestAssessment = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/assessment/latest`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    throw error;
  }
};

/**
 * Get career recommendations from AI endpoint
 */
export const getCareerRecommendations = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/career-recommendations`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

/**
 * Get skill gap analysis
 */
export const getSkillGapAnalysis = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/skill-gap-analysis`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching skill gap analysis:', error);
    throw error;
  }
};

/**
 * Get free learning resources
 */
export const getLearningResources = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/learning-resources`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    throw error;
  }
};

/**
 * Get resume guidance
 */
export const getResumeGuidance = async (payload) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/resume`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resume guidance:', error);
    throw error;
  }
};

export const getUserHistory = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/user-history`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user history:', error);
    throw error;
  }
};