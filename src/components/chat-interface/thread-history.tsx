import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import { TooltipIconButton } from "../ui/assistant-ui/tooltip-icon-button";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { Thread } from "@langchain/langgraph-sdk";
import { PiChatsCircleLight } from "react-icons/pi";
import { TighterText } from "../ui/header";
import { useGraphContext } from "@/contexts/GraphContext";
import { useToast } from "@/hooks/use-toast";
import React, { FC } from "react";
import { Dialog } from "@radix-ui/react-dialog";

interface ThreadHistoryProps {
  switchSelectedThreadCallback: (thread: Thread) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ThreadProps {
  id: string;
  onClick: () => void;
  onDelete: () => void;
  label: string;
  createdAt: Date;
}

const ThreadItem = (props: ThreadProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="flex flex-row gap-0 items-center justify-start w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Button
        className="px-2 justify-start items-center flex-grow min-w-[191px] pr-0"
        size="sm"
        variant="ghost"
        onClick={props.onClick}
      >
        <TighterText className="truncate text-sm font-light w-full text-left">
          {props.label}
        </TighterText>
      </Button>
      {isHovering && (
        <TooltipIconButton
          tooltip="Delete thread"
          variant="ghost"
          onClick={props.onDelete}
        >
          <Trash2 className="w-12 h-12 text-[#575757] hover:text-red-500 transition-colors ease-in" />
        </TooltipIconButton>
      )}
    </div>
  );
};

const LoadingThread = () => <Skeleton className="w-full h-8" />;

const convertThreadActualToThreadProps = (
  thread: Thread,
  switchSelectedThreadCallback: (thread: Thread) => void,
  deleteThread: (id: string) => void,
  onCloseSheet: () => void
): ThreadProps => ({
  id: thread.thread_id,
  label:
    thread.metadata?.thread_title ??
    ((thread.values as Record<string, any>)?.messages?.[0]?.content ||
      "Untitled"),
  createdAt: new Date(thread.created_at),
  onClick: () => {
    switchSelectedThreadCallback(thread);
    onCloseSheet();
  },
  onDelete: () => {
    return deleteThread(thread.thread_id);
  },
});

const groupThreads = (
  threads: Thread[],
  switchSelectedThreadCallback: (thread: Thread) => void,
  deleteThread: (id: string) => void,
  onCloseSheet: () => void
) => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const sevenDaysAgo = subDays(today, 7);

  return {
    today: threads
      .filter((thread) => isToday(new Date(thread.created_at)))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(
          t,
          switchSelectedThreadCallback,
          deleteThread,
          onCloseSheet
        )
      ),
    yesterday: threads
      .filter((thread) => isYesterday(new Date(thread.created_at)))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(
          t,
          switchSelectedThreadCallback,
          deleteThread,
          onCloseSheet
        )
      ),
    lastSevenDays: threads
      .filter((thread) =>
        isWithinInterval(new Date(thread.created_at), {
          start: sevenDaysAgo,
          end: yesterday,
        })
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(
          t,
          switchSelectedThreadCallback,
          deleteThread,
          onCloseSheet
        )
      ),
    older: threads
      .filter((thread) => new Date(thread.created_at) < sevenDaysAgo)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((t) =>
        convertThreadActualToThreadProps(
          t,
          switchSelectedThreadCallback,
          deleteThread,
          onCloseSheet
        )
      ),
  };
};

const prettifyDateLabel = (group: string): string => {
  switch (group) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "lastSevenDays":
      return "Last 7 days";
    case "older":
      return "Older";
    default:
      return group;
  }
};

interface ThreadsListProps {
  groupedThreads: {
    today: ThreadProps[];
    yesterday: ThreadProps[];
    lastSevenDays: ThreadProps[];
    older: ThreadProps[];
  };
}

function ThreadsList(props: ThreadsListProps) {
  return (
    <div className="flex flex-col pt-3 gap-4">
      {Object.entries(props.groupedThreads).map(([group, threads]) =>
        threads.length > 0 ? (
          <div key={group}>
            <TighterText className="text-sm font-medium mb-1 pl-2">
              {prettifyDateLabel(group)}
            </TighterText>
            <div className="flex flex-col gap-1">
              {threads.map((thread) => (
                <ThreadItem key={thread.id} {...thread} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

export const ThreadHistory: FC<ThreadHistoryProps> = ({
  switchSelectedThreadCallback,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const {
    userData: { user },
    threadData: {
      deleteThread,
      getUserThreads,
      userThreads,
      isUserThreadsLoading,
    },
    graphData: { setMessages, switchSelectedThread },
  } = useGraphContext();

  useEffect(() => {
    if (typeof window == "undefined" || userThreads.length || !user) return;

    getUserThreads(user.id);
  }, [user]);

  const handleDeleteThread = async (id: string) => {
    if (!user) {
      toast({
        title: "Failed to delete thread",
        description: "User not found",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    await deleteThread(id, user.id, () => setMessages([]));
  };

  const groupedThreads = groupThreads(
    userThreads,
    (thread) => {
      switchSelectedThread(thread);
      switchSelectedThreadCallback(thread);
    },
    handleDeleteThread,
    onClose
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="left"
          className="border-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-semibold text-gray-800">
              Chat History
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Browse and manage your past conversations.
            </SheetDescription>
          </SheetHeader>
          {isUserThreadsLoading && !userThreads.length ? (
            <div className="flex flex-col gap-1 pt-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <LoadingThread key={`loading-thread-${i}`} />
              ))}
            </div>
          ) : !userThreads.length ? (
            <p className="text-gray-500">No items found in history.</p>
          ) : (
            <ThreadsList groupedThreads={groupedThreads} />
          )}
        </SheetContent>
      </Sheet>
    </Dialog>
  );
};

export const ThreadHistoryComponent = React.memo(ThreadHistory);
