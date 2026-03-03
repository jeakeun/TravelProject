import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL; // http://localhost:8080

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 컨트롤러의 @RequestMapping("/api/travel") + @GetMapping("/ranking") 조합
export const getTopRankings = () => {
    return apiClient.get('/api/travel/ranking'); 
};

export default apiClient;