/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // Đảm bảo rằng tất cả các file trong thư mục src đều được xử lý
  ],
  plugins: [require('tailwindcss'), require('autoprefixer')],
}

