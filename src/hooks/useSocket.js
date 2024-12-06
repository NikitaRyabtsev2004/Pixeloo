// import io from "socket.io-client";
// import { drawCanvas, drawPixel } from "../utils/functions/canvas/canvasHelpers";

// export const connectSocket = (
//   serverUrl,
//   serverNumber,
//   {
//     canvasSize,
//     setPixels,
//     setHasNoMorePixels,
//     setUserCount,
//     setPixelCount,
//     canvasRef,
//     onError = () => {},
//     onDisconnect = () => {},
//     onReconnect = () => {},
//   }
// ) => {
//   if (!serverUrl) {
//     console.error(`Invalid server URL: ${serverUrl}`);
//     return null;
//   }

//   // Инициализация сокета
//   const socket = io(serverUrl, {
//     auth: {
//       token: localStorage.getItem("authToken"),
//       uniqueIdentifier: localStorage.getItem("uniqueIdentifier"),
//     },
//   });

//   // Обработка данных холста
//   socket.on(`canvas-data-${serverNumber}`, (data) => {
//     const canvasData = Array(canvasSize.height)
//       .fill(null)
//       .map(() => Array(canvasSize.width).fill("#FFFFFF"));

//     data.forEach((pixel) => {
//       if (canvasData[pixel.y] && canvasData[pixel.y][pixel.x]) {
//         canvasData[pixel.y][pixel.x] = pixel.color;
//       }
//     });

//     setPixels(canvasData);

//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       drawCanvas(canvasData, ctx);
//     }
//   });

//   // Обработка изменений пикселей
//   socket.on(`pixel-drawn-${serverNumber}`, (pixelData) => {
//     pixelData.forEach(({ x, y, color }) => {
//       setPixels((prevPixels) => {
//         const newPixels = prevPixels.map((row) => [...row]);
//         if (newPixels[y] && newPixels[x]) {
//           newPixels[y][x] = color;

//           // Отрисовка пикселя
//           const canvas = canvasRef.current;
//           if (canvas) {
//             const ctx = canvas.getContext("2d");
//             drawPixel(ctx, x, y, color);
//           }
//         }
//         return newPixels;
//       });
//     });
//   });

//   // Событие нехватки пикселей
//   socket.on("no-more-pixels", (value) => {
//     setHasNoMorePixels(value);
//   });

//   // Обновление количества пользователей
//   socket.on("user-count", (data) => {
//     if (
//       data &&
//       data.totalUsers !== undefined &&
//       data.totalConnections !== undefined
//     ) {
//       setUserCount(data);
//     }
//   });

//   // Обновление количества пикселей пользователя
//   socket.on("user-pixel-count", (data) => {
//     setPixelCount(data.pixelCount);
//   });

//   // Обработка ошибок подключения
//   socket.on("connect_error", (error) => {
//     console.error("Socket connection error:", error);
//     onError(error);
//   });

//   // Отключение
//   socket.on("disconnect", () => {
//     console.warn("Socket disconnected.");
//     onDisconnect();
//   });

//   // Подключение после отключения
//   socket.on("reconnect", () => {
//     console.log("Socket reconnected.");
//     onReconnect();
//   });

//   // Отправка информации о клиенте
//   socket.emit("client-info", {
//     uniqueIdentifier: localStorage.getItem("uniqueIdentifier"),
//   });

//   // Отправка текущего маршрута
//   socket.emit("route", window.location.pathname);

//   return socket;
// };
