import SockJS from 'sockjs-client/dist/sockjs';
import { Client, IMessage } from '@stomp/stompjs';

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'CUSTOMER' | 'MECHANIC';
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: string;
}

type NotificationCallback = (notification: Notification) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscribers: Map<string, NotificationCallback[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  connect(userId: string, userType: 'CUSTOMER' | 'MECHANIC'): void {
    if (this.connected || this.client?.active) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const socket = new SockJS('http://localhost:8086/ws');
      
      this.client = new Client({
        webSocketFactory: () => socket as any,
        debug: (str) => {
          console.log('[STOMP Debug]', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Subscribe to user-specific notifications
        const destination = `/queue/notifications/${userType.toLowerCase()}/${userId}`;
        
        this.client?.subscribe(destination, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            console.log('📩 Notification received:', notification);
            
            // Notify all subscribers
            const callbacks = this.subscribers.get(destination) || [];
            callbacks.forEach(callback => callback(notification));
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });

        console.log(`📡 Subscribed to: ${destination}`);
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        console.error('Details:', frame.body);
        this.connected = false;
      };

      this.client.onWebSocketClose = () => {
        console.log('🔌 WebSocket connection closed');
        this.connected = false;
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(userId, userType), this.reconnectDelay);
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      };

      this.client.activate();
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      this.connected = false;
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscribers.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  subscribe(destination: string, callback: NotificationCallback): void {
    if (!this.subscribers.has(destination)) {
      this.subscribers.set(destination, []);
    }
    this.subscribers.get(destination)!.push(callback);
  }

  unsubscribe(destination: string, callback: NotificationCallback): void {
    const callbacks = this.subscribers.get(destination);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;