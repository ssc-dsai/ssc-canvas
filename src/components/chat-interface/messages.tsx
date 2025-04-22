"use client";

import {
  MessagePrimitive,
  useMessage,
} from "@assistant-ui/react";
import React, { Dispatch, SetStateAction, type FC, useState, useEffect } from "react";
import { format } from 'date-fns';

import { MarkdownText } from "@/components/ui/assistant-ui/markdown-text";
import { useFeedback } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

interface AssistantFeedbackProps {
  runId: string | undefined;
  feedbackSubmitted: boolean;
  setFeedbackSubmitted: Dispatch<SetStateAction<boolean>>;
}

export const AssistantMessage: FC<AssistantFeedbackProps> = ({
  runId,
  feedbackSubmitted,
  setFeedbackSubmitted,
}) => {
  const { message } = useMessage();
  const { feedback, handleFeedback } = useFeedback(
    message.id,
    runId,
    feedbackSubmitted,
    setFeedbackSubmitted
  );

  // State to hold the formatted time string
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (message.createdAt) {
      // --- DEBUG LOG INSIDE EFFECT ---
      console.log("AssistantMsg EFFECT:", message.id, "Formatting createdAt:", message.createdAt);
      setFormattedTime(format(message.createdAt, 'p'));
    }
  }, [message.createdAt, message.id]);

  // --- DEBUG LOG ---
  console.log("Assistant Message:", message?.id, "createdAt:", message?.createdAt);

  return (
    <div className="flex flex-col gap-1 items-start group">
      <MessagePrimitive.Content
        className={cn(
          "rounded-2xl p-3 text-sm max-w-2xl",
          "rounded-bl-sm bg-gray-200"
        )}
        components={{ Text: MarkdownText }}
      />
      <div className="flex items-center gap-2 pl-1">
        {/* Display time from state */}
        {formattedTime && (
          <span className="text-xs text-gray-500">
            {formattedTime}
          </span>
        )}
        {message.content && (
          <AssistantFeedback
            feedback={feedback}
            handleFeedback={handleFeedback}
          />
        )}
      </div>
    </div>
  );
};

export const UserMessage: FC = () => {
  const { message } = useMessage();
  // State to hold the formatted time string
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (message?.createdAt) {
      // --- DEBUG LOG INSIDE EFFECT ---
      console.log("UserMsg EFFECT:", message?.id, "Formatting createdAt:", message?.createdAt);
      setFormattedTime(format(message.createdAt, 'p'));
    }
  }, [message?.createdAt, message?.id]);

  if (!message) {
    return null;
  }

  // --- DEBUG LOG ---
  console.log("User Message:", message?.id, "createdAt:", message?.createdAt);

  return (
    <div className="flex flex-col gap-1 items-end">
      <MessagePrimitive.Content
        className={cn(
          "rounded-2xl p-3 text-sm max-w-2xl",
          "rounded-br-sm bg-[#333] text-white"
        )}
        components={{ Text: MarkdownText }}
      />
      {/* Display time from state */}
      {formattedTime && (
        <span className="text-xs text-gray-500 px-1">
          {formattedTime}
        </span>
      )}
    </div>
  );
};

const AssistantFeedback: FC<{
  feedback: number | undefined;
  handleFeedback: (newFeedback: number) => void;
}> = ({ feedback, handleFeedback }) => {
  return (
    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <TooltipIconButton
        tooltip="Good response"
        variant={feedback === 1 ? "default" : "ghost"}
        className={cn(
          "size-6 p-1",
          feedback === 1 ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
        )}
        onClick={() => handleFeedback(1)}
      >
        <ThumbsUp className="w-4 h-4" />
      </TooltipIconButton>
      <TooltipIconButton
        tooltip="Bad response"
        variant={feedback === 0 ? "default" : "ghost"}
        className={cn(
          "size-6 p-1",
          feedback === 0 ? "bg-red-100 text-red-700 hover:bg-red-200" : ""
        )}
        onClick={() => handleFeedback(0)}
      >
        <ThumbsDown className="w-4 h-4" />
      </TooltipIconButton>
    </div>
  );
};
