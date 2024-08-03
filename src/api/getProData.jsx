import React from 'react'
import axios from 'axios'
import request from '@/utils/request';
export async function GetProData(param) {

    const res = request.get("/api/projects");
    console.log(res);
    return res;//这里的返回值给其他主页面的useEvent使用

}
export async function ProjectAdd(param) {
    return request.post("/api/projects", param);
}
