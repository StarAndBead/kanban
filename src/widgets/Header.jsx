import React from 'react'

function Header() {
    return (
        <header className='flex justify-between items-center h-10' >

            <nav className='flex items-center'>
                <a href="#">登录</a>
                <a href="#" className='ml-8 bg-gray-900 px-4 py-2 rounded text-blue-50 flex items-center ' >
                    注册
                </a>
            </nav>
        </header>
    )
}

export default Header