import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  showDisconnectedNotification,
  showAuthenticationRequiredNotification,
  showConnectionRestoredNotification,
} from '../../utils/helpers/notifications';
import PropTypes from 'prop-types';
import {
  PIXEL_SIZE,
  GRID_HEIGHT,
  GRID_WIDTH,
} from '../../utils/config/canvas-size';
import config from '../../utils/config/config';
import { addRecentColor } from '../../redux/slices/recentColorsSlice';
import { ServerStatus } from '../ui/ServerStatus.jsx';
import { DonationButton } from '../ui/DonationButton.jsx';
import { ControlPanel } from '../ui/ControlPanel.jsx';
import { SubscribtionModal } from '../modal/SubscribtionModal.jsx';
import { doPayment } from '../../utils/functions/payment/handlePayment';
import { ColorSelector } from '../ui/ColorSelector.jsx';
import { UserSubscription } from '../ui/UserSubscribtion.jsx';
import CoordinateHint from '../ui/CoordinateHint.jsx';
import { PixelStatus } from '../ui/PixelStatus.jsx';
import {
  drawCanvas,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  increaseScale,
  decreaseScale,
  drawPixel,
} from '../../utils/functions/canvas/canvasHelpers';
import {
  handleCanvasClick,
  handleMouseDown,
  handleMouseUp,
} from '../../utils/functions/mouse/canvasMouseEvents';
import { handlePixelClick } from '../../utils/functions/canvas/canvasInteraction';

let socket;

const Canvas = ({ isAuthenticated }) => {
  const location = useLocation();
  const serverNumber = location.pathname.split('-')[1] || '1';
  const [canvasSize] = useState({
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
  });
  let dirtyPixels = [];
  const [pixels, setPixels] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [userCount, setUserCount] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canDraw, setCanDraw] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [pixelCount, setPixelCount] = useState(0);
  const [hasNoMorePixels, setHasNoMorePixels] = useState(false);
  const [status, setStatus] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [maxPixelCount, setMaxPixelCount] = useState();
  const [DBmaxPixelCount, DBsetMaxPixelCount] = useState(100);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSubscription, setIsOpenSubscription] = useState(false);
  const [hoveredCoordinates, setHoveredCoordinates] = useState({
    x: null,
    y: null,
  });
  const [hoveredUsername, setHoveredUsername] = useState(null);
  const recentColors = useSelector((state) => state.recentColors.recentColors);
  const showControlPanel = useSelector((state) => state.ui.showControlPanel);
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const handleIncreaseScale = () => increaseScale(setScale, setOffset, scale);
  const handleDecreaseScale = () => decreaseScale(setScale, setOffset, scale);
  const handleMoveUp = () => moveUp(setOffset);
  const handleMoveDown = () => moveDown(setOffset);
  const handleMoveLeft = () => moveLeft(setOffset);
  const handleMoveRight = () => moveRight(setOffset);
  const handleDoPayment = (paymentAmount, pixelCount = null) =>
    doPayment(paymentAmount, pixelCount, socket);

  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      setPixels(
        Array(canvasSize.height)
          .fill(null)
          .map(() => Array(canvasSize.width).fill('#FFFFFF'))
      );
    }
  }, [canvasSize]);

  const connectSocket = () => {
    const serverUrl = config[`serverUrl_${serverNumber}`];
    socket = io(serverUrl, {
      auth: {
        token: localStorage.getItem('authToken'),
        uniqueIdentifier: localStorage.getItem('uniqueIdentifier'),
      },
    });

    socket.on(`canvas-data-${serverNumber}`, (data) => {
      const canvasData = Array(canvasSize.height)
        .fill(null)
        .map(() => Array(canvasSize.width).fill('#FFFFFF'));
      data.forEach((pixel) => {
        if (canvasData[pixel.y] && canvasData[pixel.y][pixel.x]) {
          canvasData[pixel.y][pixel.x] = pixel.color;
        }
      });
      setPixels(canvasData);
      drawCanvas(canvasData);
    });

    socket.on(`pixel-drawn-${serverNumber}`, (pixelData) => {
      pixelData.forEach(({ x, y, color }) => {
        setPixels((prevPixels) => {
          const newPixels = [...prevPixels];
          if (newPixels[y] && newPixels[x]) {
            newPixels[y][x] = color;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            drawPixel(ctx, x, y, color);
          }
          return newPixels;
        });
      });
    });

    socket.on('no-more-pixels', (value) => {
      setHasNoMorePixels(value);
    });

    socket.on('user-count', (data) => {
      if (
        data &&
        data.totalUsers !== undefined &&
        data.totalConnections !== undefined
      ) {
        setUserCount(data);
      }
    });
    socket.on('user-pixel-count-update', (data) => {
      setPixelCount(data.newPixelCount);
    });
    socket.on('user-pixel-count', (data) => {
      setPixelCount(data.pixelCount);
    });
    socket.on('connect_error', () => {});
    socket.on('disconnect', () => {});
    socket.emit('client-info', {
      uniqueIdentifier: localStorage.getItem('uniqueIdentifier'),
    });

    socket.emit('route', window.location.pathname);
  };

  useEffect(() => {
    connectSocket();
    return () => {
      socket.disconnect();
    };
  }, [serverNumber]);

  useEffect(() => {
    if (!status && Date.now() - lastCheckTime > 1000) {
      setStatus('offline');
    }
  }, [status, lastCheckTime]);

  useEffect(() => {
    setInterval(() => {
      socket.emit('get-max-pixel-count', (data) => {
        setMaxPixelCount(data.maxPixelCount || Infinity);
      });
    }, 5000);

    setInterval(() => {
      setPixelCount((prevPixelCount) => {
        if (prevPixelCount < maxPixelCount) {
          return prevPixelCount + 1;
        } else {
          return prevPixelCount;
        }
      });
    }, 1000);
  }, [maxPixelCount]);

  useEffect(() => {
    let checkIntervalId;

    const checkStatus = async () => {
      try {
        await socket.emit('check-server-status', (data) => {
          setStatus(data.status);
          setLastCheckTime(Date.now());
        });
      } catch (error) {
        setStatus('offline');
        setLastCheckTime(Date.now());
      }
    };

    socket.on('disconnect', () => {
      showDisconnectedNotification();
      setStatus('offline');
    });

    socket.on('connect_error', () => {
      showAuthenticationRequiredNotification();
      setStatus('offline');
    });

    socket.on('reconnect', () => {
      showConnectionRestoredNotification();
      setStatus('online');
      checkStatus();
    });

    checkIntervalId = setInterval(checkStatus, 1000);

    return () => {
      clearInterval(checkIntervalId);
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect');
    };
  }, [socket]);

  const handleCanvasClickWrapper = (e) =>
    handleCanvasClick(e, isDragging, (x, y) =>
      handlePixelClick(x, y, {
        isAuthenticated,
        canDraw,
        hasNoMorePixels,
        offset,
        scale,
        selectedColor,
        setCanDraw,
        setRemainingTime,
        setPixels,
        addRecentColor,
        dirtyPixels,
        dispatch,
        socket,
        PIXEL_SIZE,
      })
    );

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newOffsetX = offset.x + (e.clientX - dragStart.x);
      const newOffsetY = offset.y + (e.clientY - dragStart.y);

      setOffset({ x: newOffsetX, y: newOffsetY });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(
      (e.clientX - rect.left - offset.x) / (PIXEL_SIZE * scale)
    );
    const y = Math.floor(
      (e.clientY - rect.top - offset.y) / (PIXEL_SIZE * scale)
    );

    setHoveredCoordinates({ x, y });

    if (
      y >= 0 &&
      y < pixels.length &&
      x >= 0 &&
      x < pixels[0].length &&
      pixels[y][x] &&
      pixels[y][x] !== '#FFFFFF'
    ) {
      socket.emit('get-username', { x, y }, (response) => {
        if (response && response.success) {
          setHoveredUsername(response.username);
        } else {
          setHoveredUsername(null);
        }
      });
    } else {
      setHoveredUsername(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawCanvas(pixels, ctx, offset, scale);
  }, [pixels, offset, scale]);

  useEffect(() => {
    const userIdentifier = localStorage.getItem('uniqueIdentifier');
    if (!userIdentifier) {
      return;
    }

    socket.auth = { uniqueIdentifier: userIdentifier };
    socket.connect();

    const handleMaxPixelCountUpdate = ({ maxPixelCount }) => {
      DBsetMaxPixelCount(maxPixelCount);
      setIsSubscribed(maxPixelCount >= 200);
    };

    socket.on('max-pixel-count-update', handleMaxPixelCountUpdate);

    return () => {
      socket.off('max-pixel-count-update', handleMaxPixelCountUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <ServerStatus serverNumber={serverNumber} status={status} />

      <DonationButton
        amount={amount}
        isOpen={isOpen}
        setAmount={setAmount}
        setIsOpen={setIsOpen}
        handleDoPayment={handleDoPayment}
      />
      <h3 className="useful-bar">
        <UserSubscription
          isAuthenticated={isAuthenticated}
          isSubscribed={isSubscribed}
          pixelCount={pixelCount}
          DBmaxPixelCount={DBmaxPixelCount}
          setIsOpenSubscription={setIsOpenSubscription}
        />
        {socket && (
          <SubscribtionModal
            isOpenSubscription={isOpenSubscription}
            setIsOpenSubscription={setIsOpenSubscription}
            DBmaxPixelCount={DBmaxPixelCount}
            socket={socket}
            doPayment={handleDoPayment}
          />
        )}
        <CoordinateHint
          hoveredCoordinates={hoveredCoordinates}
          hoveredUsername={hoveredUsername}
        />
        <p>Посетителей на сайте: {userCount.totalConnections}</p>
        из них
        <p>Пользователей онлайн: {userCount.totalUsers}</p>
        <PixelStatus
          canDraw={canDraw}
          remainingTime={remainingTime}
          pixelCount={pixelCount}
        />
      </h3>
      <ControlPanel
        isVisible={showControlPanel}
        onIncreaseScale={handleIncreaseScale}
        onDecreaseScale={handleDecreaseScale}
        onMoveUp={handleMoveUp}
        onMoveLeft={handleMoveLeft}
        onMoveDown={handleMoveDown}
        onMoveRight={handleMoveRight}
      />
      <ColorSelector
        isAuthenticated={isAuthenticated}
        showControlPanel={showControlPanel}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        recentColors={recentColors}
      />
      <canvas
        className="canvas__main"
        ref={canvasRef}
        width={canvasSize.width * PIXEL_SIZE * scale}
        height={canvasSize.height * PIXEL_SIZE * scale}
        onClick={handleCanvasClickWrapper}
        onMouseDown={(e) => handleMouseDown(e, setIsDragging, setDragStart)}
        onMouseUp={(e) => handleMouseUp(e, setIsDragging)}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

Canvas.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default Canvas;
