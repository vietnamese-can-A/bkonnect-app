import { apiFetch } from "@/services/apiService";

const in_dev_mode = true

export async function  getPost(){
    if(in_dev_mode){
        return {
            items : [
            {id: "123",
            finderId: "1",
            title:"Casio fx 580",
            category: 'Thiết bị điện tử',
            color : "blue",
            description: "",
            campus : "Cơ sở 2 (Dĩ An)",
            building :"Tòa H2",
            specificLocation: "homie",
            foundAt: "homie house",
            createdAt: "23/07/2026",
            custody: "2",
            status:'OPEN',
            }

            ,{id: "1234",
            finderId: "1",
            title:"Casio fx 880",
            category: 'Thiết bị điện tử',
            color : "blue",
            description: "",
            campus : "Cơ sở 1 (Lý Thường Kiệt)",
            building :"Tòa H2",
            specificLocation: "homie",
            foundAt: "homie house",
            createdAt: "24/07/2026",
            custody: "2",
            status:'OPEN',}
            ]
        }
    }

    const response = await apiFetch(`/items/feed`);
    if(!response.success){
        throw Error(response.message);
    }
    return response.data;
}

export async function addImageItems( formData: FormData){
    const response =  await apiFetch<{ imageUrl: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
    if(!response.success){
        throw Error(response.message);
    }

    return response.data;
}

export async function addPost(payload : {}){

    const response = await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    
    if(!response.success){
        throw Error(response.message);
    }

    return response.data;
}