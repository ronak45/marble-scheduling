"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ListCheck } from "lucide-react"

export default function InterviewSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className="h-full min-h-screen bg-background border-r relative overflow-hidden"
      style={{ width: isCollapsed ? "3rem" : "24rem" }}
    >
      <div className="border-b h-12 flex items-center px-2">
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-accent rounded-md transition-colors duration-200 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ListCheck className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Take Home Task</h2>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto p-1 hover:bg-accent rounded-md transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="w-full p-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-4">
              <strong>Problem:</strong> Users are only booking an appointment 10% of the time! After talking to some users, we've learned that 
              by far the most important thing is finding a time that works for them. So, we want to build date/time filtering into this page.
            </p>
            <p>
              <strong>Requirement:</strong> Implement date/time filtering in the way you think will best solve the above problem.
            </p>
          </div>
        </div>)}

    </div>
  )
}
