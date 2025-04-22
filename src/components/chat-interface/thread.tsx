import { ThreadPrimitive } from "@assistant-ui/react";
import { ArrowDownIcon, SquarePen, Menu } from "lucide-react";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";
import { ProgrammingLanguageOptions } from "@/types";
import ModelSelector from "./model-selector";
import { ReflectionsDialog } from "../reflections-dialog/ReflectionsDialog";
import { ThreadHistory } from "./thread-history";
import { TighterText } from "../ui/header";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
import { ThreadWelcome } from "./welcome";
import { Composer } from "./composer";
import { AssistantMessage, UserMessage } from "./messages";
import { useToast } from "@/hooks/use-toast";
import { useLangSmithLinkToolUI } from "../tool-hooks/LangSmithLinkToolUI";
import { useGraphContext } from "@/contexts/GraphContext";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export interface ThreadProps {
  userId: string | undefined;
  hasChatStarted: boolean;
  handleQuickStart: (
    type: "text" | "code",
    language?: ProgrammingLanguageOptions
  ) => void;
  setChatStarted: Dispatch<SetStateAction<boolean>>;
  switchSelectedThreadCallback: (thread: ThreadType) => void;
}

export const Thread: FC<ThreadProps> = (props: ThreadProps) => {
  const {
    setChatStarted,
    hasChatStarted,
    handleQuickStart,
    switchSelectedThreadCallback,
  } = props;
  const { toast } = useToast();
  const {
    userData: { user },
    threadData: { createThread, modelName, setModelName },
    assistantsData: { selectedAssistant },
    graphData: { clearState, runId, feedbackSubmitted, setFeedbackSubmitted },
  } = useGraphContext();

  useLangSmithLinkToolUI();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCreateThread = async () => {
    if (!user) {
      toast({
        title: "User not found",
        description: "Failed to create thread without user",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }
    setModelName(modelName);
    clearState();
    setChatStarted(false);
    const thread = await createThread(modelName, user.id);
    if (!thread) {
      toast({
        title: "Failed to create a new thread",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <div className="pr-3 pl-6 pt-2 pb-1 flex flex-row gap-4 items-center justify-between border-b">
        <div className="flex items-center justify-start gap-2 text-gray-600">
          <TooltipIconButton
            tooltip="Toggle chat history"
            variant="ghost"
            className="w-fit h-fit p-2"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </TooltipIconButton>
          <ThreadHistory
            switchSelectedThreadCallback={switchSelectedThreadCallback}
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
          />
          <Link 
            href="/" 
            className="flex items-center gap-2 no-underline text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div className="h-12 w-24 relative">
              <img 
                src="/aip_logo.png" 
                alt="DSAI Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            <TighterText className="text-xl">
              SSC Canvas
            </TighterText>
          </Link>
          {!hasChatStarted && (
            <ModelSelector
              chatStarted={false}
              modelName={modelName}
              setModelName={setModelName}
            />
          )}
        </div>
        {hasChatStarted ? (
          <TooltipIconButton
            tooltip="New chat"
            variant="ghost"
            className="w-fit h-fit p-2"
            delayDuration={400}
            onClick={handleCreateThread}
          >
            <SquarePen className="w-6 h-6 text-gray-600" />
          </TooltipIconButton>
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <ReflectionsDialog selectedAssistant={selectedAssistant} />
          </div>
        )}
      </div>
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto scroll-smooth bg-inherit px-4 pt-8">
        {!hasChatStarted && (
          <ThreadWelcome
            handleQuickStart={handleQuickStart}
            setChatStarted={setChatStarted}
            composer={<Composer chatStarted={false} userId={props.userId} />}
          />
        )}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: (prop) => (
              <AssistantMessage
                {...prop}
                feedbackSubmitted={feedbackSubmitted}
                setFeedbackSubmitted={setFeedbackSubmitted}
                runId={runId}
              />
            ),
          }}
        />
      </ThreadPrimitive.Viewport>
      <div className="mt-4 flex w-full flex-col items-center justify-end rounded-t-lg bg-inherit pb-4 px-4">
        <ThreadScrollToBottom />
        <div className="w-full max-w-2xl">
          {hasChatStarted && (
            <div className="flex flex-col space-y-2">
              <ModelSelector
                chatStarted={true}
                modelName={modelName}
                setModelName={setModelName}
              />
              <Composer chatStarted={true} userId={props.userId} />
            </div>
          )}
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};
