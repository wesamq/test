"use client"

import { useEffect, useState } from "react"
import { useChat } from "ai/react"
import mammoth from "mammoth"
// @ts-ignore
import mixpanel from "mixpanel-browser"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function Grading() {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading: isResponseLoading,
  } = useChat()
  const [professorProfile, setProfessorProfile] = useState("")
  const [rubricPrompt, setRubricPrompt] = useState("")
  const [assignmentPrompt, setAssigmentPrompt] = useState("")
  const [studentPost, setStudentPost] = useState("")
  const [refineInstructions, setRefineInstructions] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  // const [content, setContent] = useState("")
  mixpanel.init("2cd410fcd850fc63e1d196976acaff87", {
    debug: process.env.NODE_ENV !== "production",
    track_pageview: true,
    persistence: "localStorage",
  })
  // Load the professor profile from localStorage when the component mounts
  useEffect(() => {
    const storedProfile = localStorage.getItem("professorProfile")
    const storedPrompt = localStorage.getItem("rubricPrompt")
    const storedAssigmentPrompt = localStorage.getItem("assignmentPrompt")

    if (storedProfile) {
      setProfessorProfile(storedProfile)
    }
    if (storedPrompt) {
      setRubricPrompt(storedPrompt)
    }

    if (storedAssigmentPrompt) {
      setAssigmentPrompt(storedAssigmentPrompt)
    }
  }, [])
  // Save the professor profile to localStorage when it changes
  useEffect(() => {
    if (!professorProfile) {
      return
    }
    localStorage.setItem("professorProfile", professorProfile)
  }, [professorProfile])

  // Save the discussion prompt to localStorage when it changes
  useEffect(() => {
    if (!rubricPrompt) {
      return
    }
    localStorage.setItem("rubricPrompt", rubricPrompt)
  }, [rubricPrompt])

  useEffect(() => {
    if (input) {
      // @ts-ignore
      handleSubmit({
        preventDefault: () => {},
      })
    }
  }, [input])

  const handleStudentResponseFileChange = async (e: React.ChangeEvent<any>) => {
    // alert("wesam")
    setSelectedFile(e.target.files[0])
    const file = e.target.files[0]

    try {
      const result = await mammoth.extractRawText({ arrayBuffer: file })
      setStudentPost(result.value)
      // setContent(result.value)
    } catch (error) {
      console.error("Error reading .docx file:", error)
    }
  }

  const handleRubricFileChange = async (e: React.ChangeEvent<any>) => {
    setSelectedFile(e.target.files[0])
    const file = e.target.files[0]

    try {
      const result = await mammoth.extractRawText({ arrayBuffer: file })
      setRubricPrompt(result.value)
      // setContent(result.value)
    } catch (error) {
      console.error("Error reading .docx file:", error)
    }
  }

  const handleUpload = () => {
    // You can perform file upload logic here, such as uploading the file to a server or cloud storage
    if (selectedFile) {
      console.log("Selected file:", selectedFile)
      // Example: You can use fetch to upload the file to a server
      // fetch('/api/upload', { method: 'POST', body: selectedFile });
    } else {
      console.log("No file selected")
    }
  }

  return (
    <section className="w-full space-y-9">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="professor-profile">
            Professor Background & Style
          </Label>
          <Textarea
            className="min-h-[100px]"
            id="professor-profile"
            placeholder="Enter your response style + paste in examples of your previous responses"
            value={professorProfile}
            onChange={(e) => setProfessorProfile(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rubric-prompt">
            Instructions Rubric. You can write it or upload file below.
          </Label>
          <div>
            <Input type="file" onChange={handleRubricFileChange} />
          </div>
          <Textarea
            className="min-h-[100px]"
            id="rubric-topic"
            value={rubricPrompt}
            onChange={(e) => setRubricPrompt(e.target.value)}
            placeholder="Enter the rubric prompt"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigment-prompt">Assignment</Label>
          <Textarea
            className="min-h-[100px]"
            id="assigment-topic"
            value={assignmentPrompt}
            onChange={(e) => setAssigmentPrompt(e.target.value)}
            placeholder="Enter the assignment prompt"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-post">
            Student&apos;s Post. You can write it or upload file below.
          </Label>

          <div>
            <Input
              type="file"
              onChange={handleStudentResponseFileChange}
              onClick={handleStudentResponseFileChange}
            />
          </div>

          <Textarea
            value={studentPost}
            onChange={(e) => setStudentPost(e.target.value)}
            className="min-h-[100px]"
            id="student-post"
            placeholder="Enter the student's post"
          />
        </div>
      </div>
      <Button
        onClick={() => {
          mixpanel.track("Response Generated")
          stop()
          setMessages([])
          handleInputChange({
            // @ts-ignore
            target: {
              value:
                "Professor Writing Style and Background: \n" +
                professorProfile +
                "\n" +
                "Assignment: \n" +
                assignmentPrompt +
                "\n" +
                "Rubric: \n" +
                rubricPrompt +
                "\n" +
                "Student's Response to the Assignment: \n" +
                studentPost +
                "\n" +
                "myTArequestType: \n" +
                "assignment",
            },
          })
        }}
      >
        {!isResponseLoading ? "Generate Response" : "Generating Response..."}
      </Button>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="professor-response">Professor&apos;s Response</Label>
          <Textarea
            className="min-h-[100px]"
            id="professor-response"
            value={messages[1] ? messages[1].content : ""}
            onChange={(e) =>
              setMessages([
                messages[0],
                {
                  content: e.target.value,
                  role: "assistant",
                  id: "1",
                },
              ])
            }
            placeholder="Response will be generated here"
          />
        </div>
      </div>
      {/* Text Input with Refine Response label, button that says Refine Response */}
      <Button
        onClick={() => {
          mixpanel.track("Response Copied")
          navigator.clipboard.writeText(messages[1].content)
        }}
      >
        Copy Response
      </Button>
      {messages[1] && !isResponseLoading && (
        <div className="flex items-center space-x-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="refine-response">Refine Response</Label>
            <Input
              id="refine-response"
              placeholder="Refine the professor's response - ex. make it shorter, stricter"
              value={refineInstructions}
              onChange={(e) => setRefineInstructions(e.target.value)}
            />
          </div>
          <Button
            className="mt-8"
            onClick={() => {
              if (!messages[1]) {
                alert("Please generate a response first!")
                return
              }
              // alert(rubricPrompt)
              mixpanel.track("Response Refined")
              stop()
              setMessages([])
              handleInputChange({
                // @ts-ignore
                target: {
                  value:
                    "Professor Writing Style and Background: \n" +
                    professorProfile +
                    "\n" +
                    "Assignment: \n" +
                    assignmentPrompt +
                    "\n" +
                    "Rubric: \n" +
                    rubricPrompt +
                    "\n" +
                    "Student's Response to the Assignment: \n" +
                    studentPost +
                    "\n" +
                    "myTArequestType: \n" +
                    "assignment" +
                    "\n" +
                    "Instructions for Refinement: \n" +
                    refineInstructions +
                    "\n" +
                    "Professor's Refined Response to Above Student:",
                },
              })
            }}
          >
            Refine
          </Button>
        </div>
      )}
    </section>
  )
}
