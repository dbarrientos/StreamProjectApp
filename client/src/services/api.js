export const API_URL = 'https://localhost:3000';

export const createRaffle = async (raffleData) => {
  const response = await fetch(`${API_URL}/raffles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Cookie-based session requires this
    credentials: 'include',
    body: JSON.stringify({ raffle: raffleData }),
  });
  if (!response.ok) throw new Error('Error creating raffle');
  return response.json();
};

export const getRaffles = async () => {
    const response = await fetch(`${API_URL}/raffles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching raffles');
    return response.json();
  };

export const updateRaffle = async (id, raffleData) => {
  const response = await fetch(`${API_URL}/raffles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ raffle: raffleData }),
  });
  if (!response.ok) throw new Error('Error updating raffle');
  return response.json();
};

export const registerWinner = async (raffleId, winnerData) => {
  const response = await fetch(`${API_URL}/raffles/${raffleId}/register_winner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ winner: winnerData }),
  });
  if (!response.ok) throw new Error('Error registering winner');
  return response.json();
};

export const getChatters = async () => {
    const response = await fetch(`${API_URL}/twitch/chatters`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching chatters');
    return response.json();
};

export const getSubscribers = async (broadcasterId = null) => {
    let url = `${API_URL}/twitch/subscribers`;
    if (broadcasterId) {
        url += `?broadcaster_id=${broadcasterId}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching subscribers');
    return response.json();
};

export const getFollowers = async (broadcasterId = null) => {
    let url = `${API_URL}/twitch/followers`;
    if (broadcasterId) {
        url += `?broadcaster_id=${broadcasterId}`;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching followers');
    return response.json();
};

export const getModeratedChannels = async () => {
    const response = await fetch(`${API_URL}/twitch/moderated_channels`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching moderated channels');
    return response.json();
};
export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ user: userData }),
  });
  if (!response.ok) throw new Error('Error updating user');
  return response.json();
};
