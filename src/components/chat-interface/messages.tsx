"use client";

import {
  ActionBarPrimitive,
  getExternalStoreMessage,
  MessagePrimitive,
  useMessage,
} from "@assistant-ui/react";
import React, { Dispatch, SetStateAction, type FC } from "react";

import { MarkdownText } from "@/components/ui/assistant-ui/markdown-text";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TighterText } from "../ui/header";
import { HumanMessage } from "@langchain/core/messages";
import { cn } from "@/lib/utils";

interface AssistantMessageProps {
  runId: string | undefined;
  feedbackSubmitted: boolean;
  setFeedbackSubmitted: Dispatch<SetStateAction<boolean>>;
}

export const AssistantMessage: FC<AssistantMessageProps> = ({
  runId,
  feedbackSubmitted,
  setFeedbackSubmitted,
}) => {
  const message = useMessage();
  const { isLast } = message;

  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-2xl grid-cols-[auto_1fr] grid-rows-[auto_auto] py-4 gap-x-4">
      <Avatar className="col-start-1 row-span-full row-start-1">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <div className={cn(
        "col-start-2 row-start-1 my-1.5 max-w-xl break-words leading-7 text-sm",
        "rounded-2xl p-3",
        "rounded-bl-sm bg-gray-200"
      )}>
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>

      {isLast && runId && (
        <div className="col-start-2 row-start-2">
          <span className="text-xs text-gray-400">(Feedback placeholder)</span>
        </div>
      )}
    </MessagePrimitive.Root>
  );
};

export const UserMessage: FC = () => {
  const msg = useMessage(getExternalStoreMessage<HumanMessage>);
  const humanMessage = msg && !Array.isArray(msg) ? msg : undefined;

  if (humanMessage?.additional_kwargs?.[/* OC_HIDE_FROM_UI_KEY ?? */ '__oc_hide_from_ui__']) return null;

  return (
    <MessagePrimitive.Root className="grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4">
      <div className={cn(
         "col-start-2 row-start-1 max-w-xl break-words rounded-3xl px-5 py-2.5 text-sm",
         "bg-[#333] text-white rounded-br-sm"
      )}>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

interface AssistantMessageBarProps {
  runId: string;
  feedbackSubmitted: boolean;
  setFeedbackSubmitted: Dispatch<SetStateAction<boolean>>;
}

const AssistantMessageBarComponent = ({
  runId,
  feedbackSubmitted,
  setFeedbackSubmitted,
}: AssistantMessageBarProps) => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex items-center mt-2"
    >
      <span className="text-xs text-gray-400">(Feedback placeholder)</span>
    </ActionBarPrimitive.Root>
  );
};
const AssistantMessageBar = React.memo(AssistantMessageBarComponent);
