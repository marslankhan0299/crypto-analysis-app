// components/TradingViewWidget.js
import { useEffect, useRef } from 'react';

const TradingViewWidget = ({ symbol }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Purane widget ko hata do agar ho
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    // TradingView script load karo
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        widgetRef.current = new window.TradingView.widget({
          container: containerRef.current,
          width: '100%',
          height: 500,
          symbol: symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#131313',
          enable_publishing: false,
          allow_symbol_change: false,
          hide_side_toolbar: false,
          details: false,
          hotlist: false,
          calendar: false,
          studies: [],
          show_popup_button: false,
          popup_width: '1000',
          popup_height: '650',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ width: '100%', height: 500 }} />;
};

export default TradingViewWidget;
