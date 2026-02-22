// import axios from 'axios';

// const API_URL = '/api/links/';

// export const getUserLinks = async (token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   try {
//     const response = await axios.get(API_URL + 'my-links', config);
//     return response.data;
//   } catch (error) {
//     console.error('API Error: Failed to fetch user links', error);

//     if (error.response && error.response.data) {
//       throw error.response.data;
//     } else {
//       throw new Error('An unexpected error occurred while fetching links.');
//     }
//   }
// };

// new 

import axios from 'axios';

const API_URL = '/api/links/my-links';

export const getUserLinks = async (token) => {
  try {

    const response = await axios({
      method: 'GET',
      url: API_URL,
      headers: {
        Authorization: `Bearer ${token}`, // ✅ guaranteed header attach
      },
    });

    return response.data;

  } catch (error) {
    console.error(
      'API Error: Failed to fetch user links',
      error.response?.data || error
    );

    if (error.response?.data) {
      throw error.response.data;
    }

    throw new Error('An unexpected error occurred while fetching links.');
  }
};