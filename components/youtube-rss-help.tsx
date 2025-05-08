/**
 * YouTube RSS Help component providing detailed instructions on how to properly
 * configure a YouTube RSS feed URL using a channel ID. Includes step-by-step guidance
 * with visual examples and validation for common URL format errors.
 */
"use client"

import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Info,
  ArrowRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample channel ID for example purposes - Updated to user-provided ID
const SAMPLE_CHANNEL_ID = "UCq6VFHwMzcMXbuKyG7SQYIg" // User-provided channel ID

interface YouTubeRssHelpProps {
  currentUrl?: string;
}

export function YouTubeRssHelp({ currentUrl }: YouTubeRssHelpProps) {
  const [copied, setCopied] = useState(false)
  const [testUrl, setTestUrl] = useState(currentUrl || "")
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null)
  const [channelId, setChannelId] = useState("")
  const [generatedUrl, setGeneratedUrl] = useState("")
  const [urlCopied, setUrlCopied] = useState(false)

  // Copy template URL to clipboard
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/feeds/videos.xml?channel_id=${SAMPLE_CHANNEL_ID}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate RSS URL from channel ID
  const generateRssUrl = () => {
    if (!channelId.trim()) {
      return
    }
    
    const trimmedId = channelId.trim()
    setGeneratedUrl(`https://www.youtube.com/feeds/videos.xml?channel_id=${trimmedId}`)
  }

  // Copy generated URL
  const copyGeneratedUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    }
  }

  // Validate the input URL format
  const validateUrl = () => {
    if (!testUrl) {
      setValidationResult({
        isValid: false,
        message: "Please enter a URL to validate"
      })
      return
    }

    try {
      const url = new URL(testUrl)
      
      // Check if it's a YouTube feeds URL
      if (!url.hostname.includes("youtube.com") || !url.pathname.includes("feeds/videos.xml")) {
        setValidationResult({
          isValid: false,
          message: "Not a valid YouTube RSS feed URL. URL must include youtube.com/feeds/videos.xml"
        })
        return
      }

      // Check if it uses channel_id parameter
      const channelId = url.searchParams.get("channel_id")
      if (!channelId) {
        setValidationResult({
          isValid: false,
          message: "Missing channel_id parameter. URL must contain ?channel_id=YOUR_CHANNEL_ID"
        })
        return
      }

      // Check if using channel name/handle format (@username)
      if (testUrl.includes("@")) {
        setValidationResult({
          isValid: false,
          message: "URL contains @ symbol. Use channel_id format instead of username/handle"
        })
        return
      }

      setValidationResult({
        isValid: true,
        message: "Valid YouTube RSS feed URL format!"
      })
    } catch {
      setValidationResult({
        isValid: false,
        message: "Invalid URL format"
      })
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 dark:bg-blue-950/30">
        <Info className="h-4 w-4" />
        <AlertTitle>YouTube RSS Feed Configuration</AlertTitle>
        <AlertDescription>
          To display your YouTube videos in the dashboard, you need to use the correct RSS feed URL format with your channel ID.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="validate" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="validate">Validate RSS URL</TabsTrigger>
          <TabsTrigger value="generate">Generate RSS URL</TabsTrigger>
        </TabsList>

        <TabsContent value="validate" className="space-y-3">
          <div className="space-y-3 rounded-md border p-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-sm">Required Format</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTemplate}
                  className="h-7 gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {currentUrl && currentUrl.includes("@") && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Invalid URL Format</AlertTitle>
                <AlertDescription>
                  Your current URL uses a username/handle format (@username). You need to use a channel ID instead.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-4 space-y-2">
              <label htmlFor="test-url" className="text-sm font-medium">
                Validate Your RSS URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="test-url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="Enter your YouTube RSS URL to validate"
                  className="flex-1"
                />
                <Button onClick={validateUrl}>Validate</Button>
              </div>
              {validationResult && (
                <div className={`text-sm ${validationResult.isValid ? "text-green-600" : "text-red-600"}`}>
                  {validationResult.isValid ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4" /> {validationResult.message}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {validationResult.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-3">
          <div className="rounded-md border p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Generate RSS URL from Channel ID</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your YouTube channel ID to generate the proper RSS feed URL
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="channel-id" className="text-sm font-medium">
                    Channel ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="channel-id"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="Enter your Channel ID (e.g., UCq6VFHwMzcMXbuKyG7SQYIg)"
                      className="flex-1"
                    />
                    <Button onClick={generateRssUrl}>
                      <span>Generate</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {generatedUrl && (
                  <div className="space-y-2 pt-2">
                    <label htmlFor="generated-url" className="text-sm font-medium flex items-center gap-2">
                      <span>Your RSS Feed URL</span>
                      <Badge variant="outline" className="font-normal">Ready to use</Badge>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="generated-url"
                        value={generatedUrl}
                        readOnly
                        className="flex-1 bg-muted"
                      />
                      <Button
                        variant="outline"
                        onClick={copyGeneratedUrl}
                        className="gap-1"
                      >
                        {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{urlCopied ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="find-channel-id">
          <AccordionTrigger className="text-sm font-medium">
            How to find your YouTube Channel ID
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-sm">
              <p>There are several ways to find your YouTube Channel ID:</p>
              
              <div className="space-y-2">
                <h4 className="font-medium">Method 1: From channel description (Recommended)</h4>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Go to any YouTube channel</li>
                  <li>Click on &quot;More&quot; in the channel description</li>
                  <li>Click on &quot;Share&quot;</li>
                  <li>Select &quot;Copy channel ID&quot;</li>
                </ol>
                <div className="pl-2 pt-1 text-muted-foreground">
                  This is the easiest method and works for any channel, not just your own.
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Method 2: From YouTube Studio</h4>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Log in to <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube Studio</a></li>
                  <li>Click on &quot;Settings&quot; (gear icon) in the bottom-left corner</li>
                  <li>Select &quot;Channel&quot; from the left sidebar</li>
                  <li>Click on &quot;Advanced settings&quot;</li>
                  <li>Your Channel ID appears under &quot;Channel ID&quot;</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Method 3: From a video page</h4>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Go to any of your uploaded videos</li>
                  <li>Click on your channel name under the video</li>
                  <li>Look at the URL in your browser&apos;s address bar</li>
                  <li>If it shows <code className="bg-muted px-1">youtube.com/channel/UC...</code>, the part after &quot;/channel/&quot; is your Channel ID</li>
                </ol>
              </div>
              
              <div className="mt-4">
                <Badge variant="outline" className="mr-2">Note</Badge>
                <span>Your Channel ID always starts with &quot;UC&quot; followed by a string of letters and numbers.</span>
              </div>
              
              <div className="pt-2 flex justify-end">
                <a 
                  href="https://support.google.com/youtube/answer/3250431" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                >
                  YouTube Help <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="common-errors">
          <AccordionTrigger className="text-sm font-medium">
            Common RSS Configuration Errors
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Using channel username/handle instead of channel ID
                </h4>
                <div className="pl-6 space-y-1">
                  <p><strong>Incorrect:</strong></p>
                  <code className="block bg-muted p-2 rounded text-red-500">
                    https://www.youtube.com/feeds/videos.xml?user=@YourChannelName
                  </code>
                  <p className="pt-1"><strong>Correct:</strong></p>
                  <code className="block bg-muted p-2 rounded text-green-500">
                    https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Using a normal YouTube URL instead of the RSS feed URL
                </h4>
                <div className="pl-6 space-y-1">
                  <p><strong>Incorrect:</strong></p>
                  <code className="block bg-muted p-2 rounded text-red-500">
                    https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                  <p className="pt-1"><strong>Correct:</strong></p>
                  <code className="block bg-muted p-2 rounded text-green-500">
                    https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Missing the &quot;channel_id=&quot; parameter
                </h4>
                <div className="pl-6 space-y-1">
                  <p><strong>Incorrect:</strong></p>
                  <code className="block bg-muted p-2 rounded text-red-500">
                    https://www.youtube.com/feeds/videos.xml?UCxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                  <p className="pt-1"><strong>Correct:</strong></p>
                  <code className="block bg-muted p-2 rounded text-green-500">
                    https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxxxxxxxxxxxxxxxxxxx
                  </code>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}