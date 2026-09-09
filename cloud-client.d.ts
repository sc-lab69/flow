export function connectionInfo():{google:boolean;ready:boolean;maxUploadMB:number};
export function listProjects(code?:string):Promise<Array<{id:string;title:string;author:string;description:string;created:number}>>;
export function uploadProject(form:FormData,code?:string):Promise<{id:string}>;
export function projectBytes(id:string,code?:string):Promise<ArrayBuffer>;
export function downloadProject(id:string,code?:string):Promise<void>;
