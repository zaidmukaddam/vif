import { FaqContentProps } from "@/types";

export function FaqContent({}: FaqContentProps) {
  return (
    <div className="space-y-6 p-2">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basics</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">How do I create a new todo?</h4>
            <p className="text-sm text-muted-foreground">
              Type your todo in the input field at the bottom and press Enter. You can also use voice input by clicking the microphone icon.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">How do I edit a task?</h4>
            <p className="text-sm text-muted-foreground">
              Hover over any task and click the pencil icon that appears to edit it.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">What happens to completed tasks?</h4>
            <p className="text-sm text-muted-foreground">
              They remain in your list but are marked as complete. You can clear all completed tasks from the list menu.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">Where can I find the source code?</h4>
            <p className="text-sm text-muted-foreground">
              Vif is an open source project. You can find the source code on <a href="https://github.com/zaidmukaddam/vif" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Features</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">Can I add emojis to my todos?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Click the emoji button next to the input field to open the emoji picker.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">How do I sort my todos?</h4>
            <p className="text-sm text-muted-foreground">
              Click the list icon on the left side of the input field to access sorting options.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">How do I set a due date?</h4>
            <p className="text-sm text-muted-foreground">
              Click on the date at the top of the screen to open the calendar, then select your desired date.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Voice & AI</h3>
        <div className="space-y-4">
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">Can I use voice commands?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Try saying "Add buy groceries" or "Complete buy milk" to automatically perform those actions.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">What voice commands are supported?</h4>
            <p className="text-sm text-muted-foreground">
              You can say "Add [task]", "Complete [task]", "Delete [task]", "Edit [task] to [new task]", "Sort by [criterion]", and "Clear [all/completed/incomplete]".
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/50 p-3.5 rounded-2xl">
            <h4 className="font-medium text-[15px]">Why isn't my microphone working?</h4>
            <p className="text-sm text-muted-foreground">
              Make sure you've granted microphone permissions to the app in your browser settings. If the icon is red, it means permission was denied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 