"use client";

import { notifications } from "@mantine/notifications";

type NotifyOptions = {
  title?: string;
};

export const notify = {
  success(message: string, options?: NotifyOptions) {
    notifications.show({
      color: "green",
      title: options?.title,
      message,
    });
  },
  error(message: string, options?: NotifyOptions) {
    notifications.show({
      color: "red",
      title: options?.title,
      message,
    });
  },
  info(message: string, options?: NotifyOptions) {
    notifications.show({
      color: "blue",
      title: options?.title,
      message,
    });
  },
};
