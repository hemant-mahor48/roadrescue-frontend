import SockJS from 'sockjs-client/dist/sockjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

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
type RawCallback = (data: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;

  // Callbacks for the user's personal notification queue (auto-subscribed on connect)
  private notificationSubscribers: Map<string, NotificationCallback[]> = new Map();

  // Manual STOMP subscriptions keyed by destination (for tracking topics, etc.)
  private stompSubscriptions: Map<string, StompSubscription> = new Map();
  private topicCallbacks: Map<string, RawCallback[]> = new Map();

  // Reconnect bookkeeping
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private currentUserId: string = '';
  private currentUserType: 'CUSTOMER' | 'MECHANIC' = 'CUSTOMER';

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

    this.currentUserId = userId;
    this.currentUserType = userType;

    try {
      const socket = new SockJS('http://localhost:8086/ws');

      this.client = new Client({
        webSocketFactory: () => socket as any,
        debug: (str) => console.log('[STOMP Debug]', str),
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Auto-subscribe to the user's personal notification queue
        const notifDestination = `/queue/notifications/${userType.toLowerCase()}/${userId}`;
        this.client?.subscribe(notifDestination, (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            console.log('📩 Notification received:', notification);
            const callbacks = this.notificationSubscribers.get(notifDestination) || [];
            callbacks.forEach(cb => cb(notification));
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });
        console.log(`📡 Subscribed to notifications: ${notifDestination}`);

        // Re-subscribe to any pending topic subscriptions (e.g. after reconnect)
        this.topicCallbacks.forEach((_, destination) => {
          if (!this.stompSubscriptions.has(destination)) {
            this._attachStompSubscription(destination);
          }
        });
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
        this.connected = false;
      };

      this.client.onWebSocketClose = () => {
        console.log('🔌 WebSocket connection closed');
        this.connected = false;
        this.stompSubscriptions.clear();

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
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
      this.stompSubscriptions.clear();
      this.topicCallbacks.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.notificationSubscribers.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  // ─── Notification queue subscribe/unsubscribe (existing behaviour) ────────

  subscribe(destination: string, callback: NotificationCallback): void {
    if (!this.notificationSubscribers.has(destination)) {
      this.notificationSubscribers.set(destination, []);
    }
    this.notificationSubscribers.get(destination)!.push(callback);
  }

  unsubscribe(destination: string, callback: NotificationCallback): void {
    const callbacks = this.notificationSubscribers.get(destination);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  // ─── Generic topic subscribe/unsubscribe (for /topic/tracking/{requestId}) ─

  /**
   * Subscribe to any STOMP destination (e.g. /topic/tracking/{requestId}).
   * Returns an unsubscribe function for easy cleanup in useEffect.
   */
  subscribeTopic(destination: string, callback: RawCallback): () => void {
    if (!this.topicCallbacks.has(destination)) {
      this.topicCallbacks.set(destination, []);
    }
    this.topicCallbacks.get(destination)!.push(callback);

    // If already connected, attach the STOMP subscription immediately
    if (this.connected && this.client && !this.stompSubscriptions.has(destination)) {
      this._attachStompSubscription(destination);
    }

    return () => this.unsubscribeTopic(destination, callback);
  }

  unsubscribeTopic(destination: string, callback: RawCallback): void {
    const callbacks = this.topicCallbacks.get(destination);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }

    // Remove the STOMP subscription when no listeners remain
    if (!this.topicCallbacks.get(destination)?.length) {
      this.stompSubscriptions.get(destination)?.unsubscribe();
      this.stompSubscriptions.delete(destination);
      this.topicCallbacks.delete(destination);
    }
  }

  private _attachStompSubscription(destination: string): void {
    const sub = this.client?.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const callbacks = this.topicCallbacks.get(destination) || [];
        callbacks.forEach(cb => cb(data));
      } catch (error) {
        console.error(`Error parsing message from ${destination}:`, error);
      }
    });
    if (sub) {
      this.stompSubscriptions.set(destination, sub);
      console.log(`📡 Subscribed to topic: ${destination}`);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;