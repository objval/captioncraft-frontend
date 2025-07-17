import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
          <CardDescription>
            Sorry, there was an issue with your authentication. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This could be due to an expired link, invalid token, or other authentication issue.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/login">
                Back to Login
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signup">
                Create New Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
