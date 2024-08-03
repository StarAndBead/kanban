import axios from "axios"
import Router from "next/router";
import { message as AntdMessage } from "antd";

const CreateAxiosInstance = (config) => {
    const instance = axios.create({
        timeout: 5000,
        withCredentials: true,
        ...config,
    });
    instance.interceptors.request.use(

        function (config) {
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }

    );
    instance.interceptors.response.use(
        function (response) {
            //是否已经登录成功
            const { status, data, message } = response;
            if (status === 200) {
                return data;
            }
            else if (status === 401) {
                //没权限或没登录
                return Router.push("/login");
            }
            else {
                AntdMessage.error(message || "服务端异常");
            }
        }, function (error) {
            if (error.response && error.response.status === 401) {
                return Router.push("/login");
            }
            AntdMessage.error(error?.response?.data?.message || "服务端异常");
            return Promise.reject(error);
        }

    );

    return instance;
}
const request = CreateAxiosInstance({});
export default request;