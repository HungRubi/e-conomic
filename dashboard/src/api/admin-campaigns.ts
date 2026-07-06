export type AdminCampaignRow = Record<string, any>;
export type ListCampaignsParams = Record<string, any>;
export type CampaignListResponse = { data: AdminCampaignRow[]; total: number; items?: AdminCampaignRow[] };
export function listCampaigns(_params?: any): Promise<CampaignListResponse> { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getCampaign(_id: string) { return Promise.resolve(null); }
export function createCampaign(_data: any) { return Promise.resolve({ id: "new" }); }
export function updateCampaign(..._args: any[]): Promise<void> { return Promise.resolve(); }
export function deleteCampaign(_id: string) { return Promise.resolve(); }
export async function fetchCampaigns(_params?: any): Promise<CampaignListResponse> { return { data: [], total: 0, items: [] }; }
export async function fetchCampaignById(_id: string): Promise<AdminCampaignRow | null> { return null; }
export async function publishCampaign(_id: string): Promise<void> {}
export async function archiveCampaign(_id: string): Promise<void> {}
