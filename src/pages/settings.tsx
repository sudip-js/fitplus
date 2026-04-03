import { useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/useAuthStore"

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState({
    gymName: "FitPulse Koramangala",
    address: "5th Block, Koramangala, Bengaluru 560095",
    timezone: "Asia/Kolkata",
    currency: "INR (₹)",
  })
  const [prefs, setPrefs] = useState({
    weeklyDigest: true,
    marketing: false,
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Workspace profile and lightweight preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Gym profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gname">Business name</Label>
              <Input
                id="gname"
                value={profile.gymName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, gymName: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr">Address</Label>
              <Input
                id="addr"
                value={profile.address}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, address: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tz">Timezone</Label>
                <Input
                  id="tz"
                  value={profile.timezone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, timezone: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cur">Currency</Label>
                <Input
                  id="cur"
                  value={profile.currency}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, currency: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button
              className="rounded-xl"
              onClick={() => toast.success("Preferences saved (local only)")}
            >
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user?.email}
              </span>
            </p>
            <Separator />
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Weekly digest email</span>
              <input
                type="checkbox"
                checked={prefs.weeklyDigest}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, weeklyDigest: e.target.checked }))
                }
                className="h-4 w-4 rounded border-input"
              />
            </label>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Product updates</span>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, marketing: e.target.checked }))
                }
                className="h-4 w-4 rounded border-input"
              />
            </label>
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => toast.message("Notification settings updated")}
            >
              Update notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
