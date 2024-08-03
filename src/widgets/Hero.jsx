import React from 'react'
import { Button } from 'antd'
function Hero() {
    return (
        <div className='grid justify-items-center gap-8 pg-28 relative'>
            <p className='text-3xl md:text-5xl font-black text-center leading-normal md:leading-normal'>
                欢迎使用敏捷看板
            </p>
            <p className='test-xl text-gray-700 md:w-1/2 text-center'>
                敏捷看板（Agile Kanban）是一种敏捷项目管理工具，旨在帮助团队有效地规划、跟踪和管理工作流程。
                <br />
                敏捷看板通过其简单而高效的方法，
                帮助团队更好地组织和管理工作，实现高质量、高效率的项目交付。
            </p>
            <div>
                <button className='rounded bg-blue-200  text-white py-3 px-8' >
                    立即登录
                </button>
                <button className='rounded bg-gray-100  text-black py-3 px-8 ml-3' >
                    立即注册
                </button>

            </div>

            <div className="relative w-full">
                <svg
                    width="256"
                    height="256"
                    viewBox="0 0 256 256"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-0 -z-10"
                >
                    <circle cx="128" cy="128" r="128" fill="url(#paint0_linear_0_22)" />
                    <defs>
                        <linearGradient
                            id="paint0_linear_0_22"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="256"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stop-color="white" />
                            <stop offset="0.774017" stop-color="#EAEAEA" />
                            <stop offset="1" stop-color="#DFDFDF" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div>
                <svg
                    width="128"
                    height="128"
                    viewBox="0 0 128 128"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute bottom-0 md:bottom-20 -left-10 -z-10"
                >
                    <circle cx="64" cy="64" r="64" fill="url(#paint0_linear_0_23)" />
                    <defs>
                        <linearGradient
                            id="paint0_linear_0_23"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="128"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stop-color="white" />
                            <stop offset="0.774017" stop-color="#EAEAEA" />
                            <stop offset="1" stop-color="#DFDFDF" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    )
}

export default Hero