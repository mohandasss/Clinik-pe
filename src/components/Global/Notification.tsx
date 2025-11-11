import React, { useEffect } from "react";
import {
  Notification as MantineNotification,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

interface NotificationData {
  success: boolean;
  message: string;
}

interface NotificationProps {
  open: boolean;
  data: NotificationData;
  onClose?: () => void;
  /** milliseconds until auto close; set 0 to disable */
  autoClose?: number;
}

const Notification: React.FC<NotificationProps> = ({
  open,
  data,
  onClose,
  autoClose = 4000,
}) => {
  useEffect(() => {
    if (!open) return;
    if (!autoClose || autoClose <= 0) return;
    const t = setTimeout(() => {
      if (onClose) onClose();
    }, autoClose);
    return () => clearTimeout(t);
  }, [open, autoClose, onClose]);

  if (!open) return null;

  const color = data.success ? "teal" : "red";
  const Icon = data.success ? IconCheck : IconX;

  return (
    <div className="fixed top-4 right-4 z-50">
      <MantineNotification
        onClose={onClose}
        color={color}
        icon={
          <ThemeIcon color={color} radius="xl" size={36} variant="filled">
            <Icon size={18} />
          </ThemeIcon>
        }
        className="max-w-sm"
      >
        <Text size="sm">{data.message}</Text>
      </MantineNotification>
    </div>
  );
};

export default Notification;
