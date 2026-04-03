import React from 'react';
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'vc-design/dist/index.css';
import 'vc-biz/dist/index.css';
import App from './App';
import './index.css';

// Ant Design v5 的 DatePicker/Calendar 在 dayjs 下依赖 weekday/localeData 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
