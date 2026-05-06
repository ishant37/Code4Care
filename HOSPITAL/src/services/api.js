// All data is now served from mockData.ts — no backend required.
// This file is kept so existing import paths don't break.

export const loginUser   = async () => ({ data: {} });
export const getMe       = async () => ({ data: {} });
export const healthCheck = async () => ({ data: { status: "demo" } });
export const getWards    = async () => ({ data: { wards: [] } });
export const getInitialData = async () => ({ data: {} });
export const getWardStats   = async () => ({ data: {} });

export const connectWebSocket = () => null;

export default { get: () => {}, post: () => {} };
