// import React, { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import { useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { toggleControlPanel } from '../../redux/slices/uiSlice';
// import {
//   showDisconnectedNotification,
//   showAuthenticationRequiredNotification,
//   showConnectionRestoredNotification,
//   showOutOfPixelsNotification,
//   showDonationAlert,
//   showDonationSucces,
//   showDonationError,
//   showDonationMakeError,
// } from '../../utils/notifications';
// import axios from 'axios';
// import PropTypes from 'prop-types';

// let socket;

// const PIXEL_SIZE = 10;
// const GRID_WIDTH = 200;
// const GRID_HEIGHT = 200;

// const Canvas = ({ isAuthenticated }) => {
//   const location = useLocation();
//   const serverNumber = location.pathname.split('-')[1] || '1';
//   const [canvasSize] = useState({
//     width: GRID_WIDTH,
//     height: GRID_HEIGHT,
//   });
//   const [pixels, setPixels] = useState([]);
//   const [selectedColor, setSelectedColor] = useState('#000000');
//   const [recentColors, setRecentColors] = useState([]);
//   const [userCount, setUserCount] = useState(0);
//   const [scale, setScale] = useState(1);
//   const canvasRef = useRef(null);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const config = require('../../utils/config');
//   const [canDraw, setCanDraw] = useState(true);
//   const [remainingTime, setRemainingTime] = useState(0);
//   const [pixelCount, setPixelCount] = useState(0);
//   const [hasNoMorePixels, setHasNoMorePixels] = useState(false);
//   const [status, setStatus] = useState('');
//   const [lastCheckTime, setLastCheckTime] = useState(Date.now());
//   const [maxPixelCount, setMaxPixelCount] = useState();
//   const [DBmaxPixelCount, DBsetMaxPixelCount] = useState(100);
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [amount, setAmount] = useState('');
//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpenSubscription, setIsOpenSubscription] = useState(false);
//   const [hoveredCoordinates, setHoveredCoordinates] = useState({
//     x: null,
//     y: null,
//   });
//   const [hoveredUsername, setHoveredUsername] = useState(null);

//   const dispatch = useDispatch();
//   const showControlPanel = useSelector((state) => state.ui.showControlPanel);

//   useEffect(() => {
//     const storedColors = JSON.parse(localStorage.getItem('recentColors')) || [];
//     setRecentColors(storedColors);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('recentColors', JSON.stringify(recentColors));
//   }, [recentColors]);

//   useEffect(() => {
//     if (canvasSize.width > 0 && canvasSize.height > 0) {
//       setPixels(
//         Array(canvasSize.height)
//           .fill(null)
//           .map(() => Array(canvasSize.width).fill('#FFFFFF'))
//       );
//     }
//   }, [canvasSize]);

//   const connectSocket = () => {
//     const serverUrl = config[`serverUrl_${serverNumber}`];
//     socket = io(serverUrl, {
//       auth: {
//         token: localStorage.getItem('authToken'),
//         uniqueIdentifier: localStorage.getItem('uniqueIdentifier'),
//       },
//     });

//     socket.on(`canvas-data-${serverNumber}`, (data) => {
//       const canvasData = Array(canvasSize.height)
//         .fill(null)
//         .map(() => Array(canvasSize.width).fill('#FFFFFF'));
//       data.forEach((pixel) => {
//         if (canvasData[pixel.y] && canvasData[pixel.y][pixel.x]) {
//           canvasData[pixel.y][pixel.x] = pixel.color;
//         }
//       });
//       setPixels(canvasData);
//       drawCanvas(canvasData);
//     });

//     socket.on(`pixel-drawn-${serverNumber}`, (pixelData) => {
//       setPixels((prevPixels) => {
//         const newPixels = [...prevPixels];
//         pixelData.forEach(({ x, y, color }) => {
//           if (newPixels[y] && newPixels[y][x]) {
//             newPixels[y][x] = color;
//             drawPixel(x, y, color);
//           }
//         });
//         return newPixels;
//       });
//     });

//     socket.on('no-more-pixels', (value) => {
//       setHasNoMorePixels(value);
//     });

//     socket.on('user-count', (count) => {
//       setUserCount(count);
//     });

//     socket.on('user-pixel-count', (data) => {
//       setPixelCount(data.pixelCount);
//     });

//     socket.on('connect_error', (err) => {
//       console.error('Connection error:', err);
//     });

//     socket.on('disconnect', () => {
//       console.log('Disconnected from server');
//     });

//     socket.emit('client-info', {
//       uniqueIdentifier: localStorage.getItem('uniqueIdentifier'),
//     });

//     let route = window.location.pathname;
//     socket.emit('route', route);
//   };

//   useEffect(() => {
//     connectSocket();
//     return () => {
//       socket.disconnect();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [serverNumber]);

//   useEffect(() => {
//     if (!status && Date.now() - lastCheckTime > 1000) {
//       setStatus('offline');
//     }
//   }, [status, lastCheckTime]);

//   useEffect(() => {
//     setInterval(() => {
//       socket.emit('get-max-pixel-count', (data) => {
//         setMaxPixelCount(data.maxPixelCount || Infinity);
//       });
//     }, 5000);

//     setInterval(() => {
//       setPixelCount((prevPixelCount) => {
//         if (prevPixelCount < maxPixelCount) {
//           return prevPixelCount + 1;
//         } else {
//           return prevPixelCount;
//         }
//       });
//     }, 5000);
//   }, [maxPixelCount]);

//   useEffect(() => {
//     let checkIntervalId;

//     const checkStatus = async () => {
//       try {
//         await socket.emit('check-server-status', (data) => {
//           setStatus(data.status);
//           setLastCheckTime(Date.now());
//         });
//       } catch (error) {
//         console.error('Ошибка при проверке статуса:', error);
//         setStatus('offline');
//         setLastCheckTime(Date.now());
//       }
//     };

//     socket.on('disconnect', () => {
//       showDisconnectedNotification();
//       setStatus('offline');
//     });

//     socket.on('connect_error', () => {
//       showAuthenticationRequiredNotification();
//       setStatus('offline');
//     });

//     socket.on('reconnect', () => {
//       showConnectionRestoredNotification();
//       setStatus('online');
//       checkStatus();
//     });

//     checkIntervalId = setInterval(checkStatus, 1000);

//     return () => {
//       clearInterval(checkIntervalId);
//       socket.off('disconnect');
//       socket.off('connect_error');
//       socket.off('reconnect');
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [socket]);

//   const drawCanvas = (canvasData) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.save();
//     ctx.setTransform(1, 0, 0, 1, offset.x, offset.y);

//     canvasData.forEach((row, y) => {
//       row.forEach((color, x) => {
//         drawPixel(x, y, color);
//       });
//     });

//     ctx.restore();
//   };

//   const drawPixel = (x, y, color) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.fillStyle = color;
//     ctx.fillRect(
//       x * PIXEL_SIZE * scale,
//       y * PIXEL_SIZE * scale,
//       PIXEL_SIZE * scale,
//       PIXEL_SIZE * scale
//     );
//   };

//   const increaseScale = () => {
//     setScale((prevScale) => {
//       if (prevScale < 2) {
//         return Math.min(prevScale + 0.2, 2);
//       }
//       return prevScale;
//     });

//     setOffset((prevOffset) => {
//       if (scale < 2) {
//         return {
//           ...prevOffset,
//           y: prevOffset.y - 70,
//           x: prevOffset.x - 70,
//         };
//       }
//       return prevOffset;
//     });
//   };

//   const decreaseScale = () => {
//     setScale((prevScale) => {
//       if (prevScale > 0.6) {
//         return Math.max(prevScale - 0.2, 0.6);
//       }
//       return prevScale;
//     });

//     setOffset((prevOffset) => {
//       if (scale > 0.6) {
//         return {
//           ...prevOffset,
//           y: prevOffset.y + 70,
//           x: prevOffset.x + 70,
//         };
//       }
//       return prevOffset;
//     });
//   };

//   const handlePixelClick = (x, y) => {
//     if (!isAuthenticated || !localStorage.getItem('uniqueIdentifier')) {
//       showAuthenticationRequiredNotification();
//       return;
//     }

//     if (!canDraw) {
//       return;
//     }

//     if (hasNoMorePixels) {
//       showOutOfPixelsNotification();
//       return;
//     }

//     setCanDraw(false);
//     setRemainingTime(300);

//     const interval = setInterval(() => {
//       setRemainingTime((prev) => {
//         if (prev <= 100) {
//           clearInterval(interval);
//           setCanDraw(true);
//           return 0;
//         }
//         return prev - 100;
//       });
//     }, 100);

//     const adjustedX = Math.floor((x - offset.x) / (PIXEL_SIZE * scale));
//     const adjustedY = Math.floor((y - offset.y) / (PIXEL_SIZE * scale));
//     const color = selectedColor;

//     setRecentColors((prevColors) => {
//       const newColors = [color, ...prevColors.filter((c) => c !== color)];
//       return newColors.slice(0, 10);
//     });

//     const newPixel = {
//       x: adjustedX,
//       y: adjustedY,
//       color,
//       userId: localStorage.getItem('uniqueIdentifier'),
//     };

//     setPixels((prevPixels) => {
//       const newPixels = prevPixels.map((row) => [...row]);
//       if (newPixels[adjustedY] && newPixels[adjustedX]) {
//         newPixels[adjustedY][adjustedX] = newPixel.color;
//         drawPixel(adjustedX, adjustedY, newPixel.color);
//       }
//       return newPixels;
//     });

//     socket.emit('draw-pixel', newPixel);
//   };

//   const handleCanvasClick = (e) => {
//     if (e.button === 0 && !isDragging) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
//       handlePixelClick(x, y);
//     }
//   };

//   const handleMouseDown = (e) => {
//     if (e.button === 0 || e.button === 1 || e.button === 2) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX, y: e.clientY });
//     }

//     if (e.button === 2) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       const x = Math.floor(
//         (e.clientX - rect.left - offset.x) / (PIXEL_SIZE * scale)
//       );
//       const y = Math.floor(
//         (e.clientY - rect.top - offset.y) / (PIXEL_SIZE * scale)
//       );

//       if (pixels[y] && pixels[y][x]) {
//         setSelectedColor(pixels[y][x]);
//       }
//     }
//   };

//   const handleMouseUp = (e) => {
//     if (e.button === 0 || e.button === 1 || e.button === 2) {
//       setIsDragging(false);
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (isDragging) {
//       const newOffsetX = offset.x + (e.clientX - dragStart.x);
//       const newOffsetY = offset.y + (e.clientY - dragStart.y);

//       setOffset({ x: newOffsetX, y: newOffsetY });
//       setDragStart({ x: e.clientX, y: e.clientY });
//       return;
//     }

//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = Math.floor(
//       (e.clientX - rect.left - offset.x) / (PIXEL_SIZE * scale)
//     );
//     const y = Math.floor(
//       (e.clientY - rect.top - offset.y) / (PIXEL_SIZE * scale)
//     );

//     setHoveredCoordinates({ x, y });

//     if (
//       y >= 0 &&
//       y < pixels.length &&
//       x >= 0 &&
//       x < pixels[0].length &&
//       pixels[y][x] &&
//       pixels[y][x] !== '#FFFFFF'
//     ) {
//       socket.emit('get-username', { x, y }, (response) => {
//         if (response && response.success) {
//           setHoveredUsername(response.username);
//         } else {
//           setHoveredUsername(null);
//         }
//       });
//     } else {
//       setHoveredUsername(null);
//     }
//   };

//   useEffect(() => {
//     drawCanvas(pixels);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [offset, pixels, scale]);

//   const moveUp = () => {
//     setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y + 70 }));
//   };

//   const moveDown = () => {
//     setOffset((prevOffset) => ({ ...prevOffset, y: prevOffset.y - 70 }));
//   };

//   const moveLeft = () => {
//     setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x + 70 }));
//   };

//   const moveRight = () => {
//     setOffset((prevOffset) => ({ ...prevOffset, x: prevOffset.x - 70 }));
//   };

//   const handleUpdateMaxPixelCount = (newMaxPixelCount) => {
//     if (!socket) {
//       console.error('Socket is not initialized.');
//       return;
//     }

//     socket.emit('update-max-pixel-count', { newMaxPixelCount }, (response) => {
//       if (response.success) {
//         window.location.reload();
//       } else {
//         console.error('Error updating maxPixelCount:', response.message);
//       }
//     });
//   };

//   const handlePayment = async (paymentAmount, pixelCount = null) => {
//     try {
//       if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
//         showDonationAlert();
//         return;
//       }

//       const maxRetries = 5;
//       const createPaymentWithRetry = async () => {
//         let retryCount = 0;

//         while (retryCount < maxRetries) {
//           try {
//             const response = await axios.post(
//               'http://localhost:15000/api/create-payment',
//               {
//                 amount: paymentAmount,
//                 description: pixelCount
//                   ? 'Оплата подписки'
//                   : 'Произвольная оплата',
//               }
//             );

//             return response.data;
//           } catch (error) {
//             if (error.response && error.response.status === 429) {
//               retryCount++;
//               const waitTime = Math.pow(2, retryCount) * 200;
//               console.log(
//                 `Превышен лимит запросов. Повтор через ${
//                   waitTime / 200
//                 } секунд...`
//               );
//               await new Promise((resolve) => setTimeout(resolve, waitTime));
//             } else {
//               throw error;
//             }
//           }
//         }

//         throw new Error('Превышено количество попыток. Оплата не удалась.');
//       };

//       const { confirmationUrl, paymentId } = await createPaymentWithRetry();

//       window.open(confirmationUrl, '_blank');

//       const checkPaymentStatus = () => {
//         const interval = setInterval(async () => {
//           try {
//             const statusResponse = await axios.get(
//               `http://localhost:15000/api/check-payment/${paymentId}`
//             );
//             const { status } = statusResponse.data;

//             if (status === 'succeeded') {
//               clearInterval(interval);

//               if (pixelCount) {
//                 handleUpdateMaxPixelCount(pixelCount);
//               }

//               showDonationSucces();
//             } else if (status === 'canceled' || status === 'failed') {
//               clearInterval(interval);
//               showDonationError();
//             }
//           } catch (error) {
//             console.error('Ошибка при проверке статуса платежа:', error);
//             clearInterval(interval);
//           }
//         }, 3000);
//       };

//       checkPaymentStatus();
//     } catch (error) {
//       console.error('Ошибка при создании платежа:', error);
//       showDonationMakeError();
//     }
//   };

//   useEffect(() => {
//     const userIdentifier = localStorage.getItem('uniqueIdentifier');
//     if (!userIdentifier) {
//       console.error('User identifier not found.');
//       return;
//     }

//     socket.auth = { uniqueIdentifier: userIdentifier };
//     socket.connect();

//     const handleMaxPixelCountUpdate = ({ maxPixelCount }) => {
//       DBsetMaxPixelCount(maxPixelCount);
//       setIsSubscribed(maxPixelCount >= 200);
//     };

//     socket.on('max-pixel-count-update', handleMaxPixelCountUpdate);

//     return () => {
//       socket.off('max-pixel-count-update', handleMaxPixelCountUpdate);
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {}, [DBmaxPixelCount]);

//   return (
//     <>
//       <div>
//         <p className="online_status">
//           Статус сервера-{serverNumber}: {status}
//         </p>
//         {status === 'offline' && (
//           <p className="status_alert">
//             Техническое обслуживание. Пожалуйста, попробуйте позже или
//             перезагрузите страницу
//           </p>
//         )}
//       </div>

//       <div className="donation_content">
//         {isOpen ? (
//           <div>
//             <input
//               type="number"
//               placeholder="Введите сумму"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               style={{
//                 width: '100%',
//                 border: '1px solid black',
//               }}
//             />
//             <button
//               onClick={() => handlePayment(parseFloat(amount))}
//               className="server_button"
//             >
//               Пожертвовать
//             </button>
//             <button onClick={() => setIsOpen(false)} className="server_button">
//               Отмена
//             </button>
//           </div>
//         ) : (
//           <div>
//             <button className="server_button" onClick={() => setIsOpen(true)}>
//               Поддержать проект
//             </button>
//           </div>
//         )}
//       </div>

//       <div>
//         <h3 className="counter">
//           <div>
//             {isOpenSubscription ? (
//               <div className="SubscriptionModal__Content">
//                 {DBmaxPixelCount < 200 && (
//                   <button
//                     onClick={() => handlePayment(99, 200)}
//                     className="server_button"
//                   >
//                     <p className="Subscription__cost">
//                       Оформить подписку за 99₽
//                     </p>
//                     <p className="Subscription__info">
//                       Увеличение лимита до 200PX
//                     </p>
//                   </button>
//                 )}
//                 {DBmaxPixelCount < 300 && (
//                   <button
//                     onClick={() => handlePayment(179, 300)}
//                     className="server_button"
//                   >
//                     <p className="Subscription__cost">
//                       Оформить подписку за 179₽
//                     </p>
//                     <p className="Subscription__info">
//                       Увеличение лимита до 300PX
//                     </p>
//                   </button>
//                 )}
//                 {DBmaxPixelCount < 400 && (
//                   <button
//                     onClick={() => handlePayment(259, 400)}
//                     className="server_button"
//                   >
//                     <p className="Subscription__cost">
//                       Оформить подписку за 259₽
//                     </p>
//                     <p className="Subscription__info">
//                       Увеличение лимита до 400PX
//                     </p>
//                   </button>
//                 )}
//                 <button
//                   onClick={() => setIsOpenSubscription(false)}
//                   className="server_button"
//                 >
//                   Отмена
//                 </button>
//               </div>
//             ) : null}

//             {isAuthenticated && (
//               <>
//                 {isSubscribed ? (
//                   <>
//                     {DBmaxPixelCount < 400 && (
//                       <>
//                         <div
//                           style={{
//                             width: '100%',
//                             padding: '5px 2px',
//                             backgroundColor: '#4CAF50',
//                             color: '#fff',
//                             border: 'none',
//                             fontSize: '12px',
//                           }}
//                         >
//                           Вы подписаны
//                         </div>
//                         <button onClick={() => setIsOpenSubscription(true)}>
//                           Увеличить подписку
//                         </button>
//                       </>
//                     )}
//                     {DBmaxPixelCount === 400 && (
//                       <>
//                         <div
//                           style={{
//                             width: '100%',
//                             padding: '5px 2px',
//                             backgroundColor: '#4CAF50',
//                             color: '#fff',
//                             border: 'none',
//                             fontSize: '12px',
//                           }}
//                         >
//                           Максимальная подписка
//                         </div>
//                       </>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <button onClick={() => setIsOpenSubscription(true)}>
//                       Оформить подписку
//                     </button>
//                   </>
//                 )}
//               </>
//             )}

//             <div className="Coordinations__Container">
//               <div className="Pixel-Username__Row">
//                 {hoveredUsername && (
//                   <div className="Pixel-Username__container">
//                     <p>Никнейм: {hoveredUsername}</p>
//                   </div>
//                 )}
//               </div>
//               <div className="Coordinations">
//                 Координаты:
//                 <p>X: {hoveredCoordinates.x}</p>
//                 <p>Y: {hoveredCoordinates.y}</p>
//               </div>
//             </div>
//           </div>
//           Онлайн пользователей {userCount}
//           <div
//             style={{
//               height: '10px',
//               width: '100px',
//               backgroundColor: '#ddd',
//               margin: '5px auto',
//               position: 'relative',
//             }}
//           >
//             <div
//               style={{
//                 height: '100%',
//                 width: `${canDraw ? 0 : (remainingTime / 300) * 100}%`,
//                 backgroundColor: 'green',
//                 transition: 'width 0.2s linear',
//               }}
//             />
//             <div
//               style={{
//                 position: 'absolute',
//                 top: '0',
//                 left: '0',
//                 right: '0',
//                 bottom: '0',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: 'black',
//               }}
//             >
//               {remainingTime > 0 ? `${remainingTime} ms` : 'Готово'}
//             </div>
//           </div>
//           <div
//             style={{
//               marginTop: '5px',
//               color: 'black',
//               textAlign: 'center',
//             }}
//           >
//             Количество: {pixelCount}
//             <div>1PX в [5]сек</div>
//           </div>
//         </h3>

//         {isAuthenticated && (
//           <>
//             <div>
//               <div className="color-selector">
//                 <button
//                   className="toggle-control-panel"
//                   onClick={() => dispatch(toggleControlPanel())}
//                 >
//                   {showControlPanel ? 'Скрыть панель' : 'Показать панель'}
//                 </button>
//                 <ColorPalette
//                   selectedColor={selectedColor}
//                   setSelectedColor={setSelectedColor}
//                 />
//                 <h3>Ваш цвет: {selectedColor}</h3>
//                 <h3>Недавние цвета:</h3>
//                 <div
//                   style={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <div
//                     style={{
//                       position: 'absolute',
//                       marginBottom: '30px',
//                       display: 'flex',
//                       justifyContent: 'center',
//                       flexWrap: 'wrap',
//                     }}
//                   >
//                     {recentColors.map((color, index) => (
//                       <div
//                         key={index}
//                         onClick={() => setSelectedColor(color)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter' || e.key === ' ') {
//                             setSelectedColor(color);
//                           }
//                         }}
//                         role="button" // Указывает, что элемент ведет себя как кнопка
//                         tabIndex={0} // Дает возможность фокусировать элемент с клавиатуры
//                         style={{
//                           width: '20px',
//                           height: '20px',
//                           backgroundColor: color,
//                           cursor: 'pointer',
//                           border: '1px solid black',
//                           margin: '2px',
//                         }}
//                       ></div>
//                     ))}
//                   </div>
//                 </div>
//                 <div style={{ marginTop: '80px' }} />
//               </div>
//             </div>
//             {showControlPanel && (
//               <div className="control-buttons">
//                 <button className="zoom-button plus" onClick={increaseScale}>
//                   +
//                 </button>
//                 <button className="move-arrow up-arrow" onClick={moveUp}>
//                   ↑
//                 </button>
//                 <button className="zoom-button minus" onClick={decreaseScale}>
//                   -
//                 </button>
//                 <button className="move-arrow left-arrow" onClick={moveLeft}>
//                   ←
//                 </button>
//                 <button className="move-arrow down-arrow" onClick={moveDown}>
//                   ↓
//                 </button>
//                 <button className="move-arrow right-arrow" onClick={moveRight}>
//                   →
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         <canvas
//           ref={canvasRef}
//           width={canvasSize.width * PIXEL_SIZE * scale}
//           height={canvasSize.height * PIXEL_SIZE * scale}
//           onClick={handleCanvasClick}
//           onMouseDown={handleMouseDown}
//           onMouseUp={handleMouseUp}
//           onMouseMove={handleMouseMove}
//           onContextMenu={(e) => e.preventDefault()}
//           style={{
//             cursor: 'crosshair',
//             padding: '0px',
//             margin: '0px',
//           }}
//         />
//       </div>
//     </>
//   );
// };

// const ColorPalette = ({ selectedColor, setSelectedColor }) => {
//   const colors = [
//     '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF',
//     '#FFFF00', '#00ccff', '#800080', '#ff8800'
//   ];

//   const handleColorSelect = (color) => {
//     setSelectedColor(color);
//   };

//   return (
//     <div className="colors-pallete">
//       {colors.map((color, index) => (
//         <div
//           key={index}
//           onClick={() => handleColorSelect(color)}
//           onKeyDown={(e) => {
//             // Поддержка клавиш Enter и Space для выбора цвета
//             if (e.key === 'Enter' || e.key === ' ') {
//               handleColorSelect(color);
//             }
//           }}
//           role="button"   // Делает div кнопкой для ассистивных технологий
//           tabIndex={0}    // Позволяет фокусировать элемент с помощью клавиатуры
//           style={{
//             width: '20px',
//             height: '20px',
//             backgroundColor: color,
//             cursor: 'pointer',
//             border: color === selectedColor ? '3px solid black' : '1px solid #ddd',
//             margin: '2px',
//           }}
//         />
//       ))}
//       <input
//         type="color"
//         value={selectedColor}
//         onChange={(e) => setSelectedColor(e.target.value)}
//       />
//     </div>
//   );
// };

// ColorPalette.propTypes = {
//   selectedColor: PropTypes.string.isRequired, 
//   setSelectedColor: PropTypes.func.isRequired,
// };

// export default Canvas;
