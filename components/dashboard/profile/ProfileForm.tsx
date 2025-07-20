import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"

interface ProfileFormData {
  first_name: string
  last_name: string
  phone_number: string
  street: string
  city: string
  zip_code: string
}

interface ProfileFormProps {
  formData: ProfileFormData
  saving: boolean
  onChange: (field: keyof ProfileFormData, value: string) => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileForm({
  formData,
  saving,
  onChange,
  onSave,
  onCancel
}: ProfileFormProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="first_name" className="text-xs">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onChange("first_name", e.target.value)}
            placeholder="First name"
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="last_name" className="text-xs">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onChange("last_name", e.target.value)}
            placeholder="Last name"
            className="h-9"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone_number" className="text-xs">Phone Number</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => onChange("phone_number", e.target.value)}
          placeholder="+972 50 123 4567"
          className="h-9"
        />
      </div>
      
      <div>
        <Label htmlFor="street" className="text-xs">Street Address</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => onChange("street", e.target.value)}
          placeholder="123 Main St"
          className="h-9"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-xs">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Tel Aviv"
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="zip_code" className="text-xs">Zip Code</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => onChange("zip_code", e.target.value)}
            placeholder="12345"
            className="h-9"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={onSave} 
          disabled={saving}
          size="sm"
          className="flex-1"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={saving}
          size="sm"
          className="flex-1"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </>
  )
}