"use client";

import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {X, Search} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Resident = {
  residentId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthDate?: string;
  houseNumber?: string;
  street?: string;
  purok?: string;
  barangayHall?: string;
  civilStatus?: string;
  occupation?: string;
  contactName?: string;
  contactPhone?: string;
  registrationDate?: string;
  email?: string;
  emailVerified?: boolean;
};

interface ResidentLookupProps {
  open: boolean;
  onClose: () => void;
}

export default function ResidentLookup({open, onClose}: ResidentLookupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [purok, setPurok] = useState("");
  const [barangayHall, setBarangayHall] = useState("");
  const [email, setEmail] = useState("");
  const [residentId, setResidentId] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Resident[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset on close
      setFirstName("");
      setLastName("");
      setPurok("");
      setBarangayHall("");
      setEmail("");
      setResidentId("");
      setResults([]);
      setTouched(false);
      setLoading(false);
    }
  }, [open]);

  const hasAnyFilter = useMemo(
    () => !!(firstName || lastName || purok || barangayHall || email || residentId),
    [firstName, lastName, purok, barangayHall, email, residentId]
  );

  // small helper so invalid dates don't break rendering
  const safeDate = (v?: string) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const doFilter = async () => {
    setTouched(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (firstName) params.set("firstName", firstName.trim());
      if (lastName) params.set("lastName", lastName.trim());
      if (purok) params.set("purok", purok.trim());
      if (barangayHall) params.set("barangayHall", barangayHall.trim());
      if (email) params.set("email", email.trim());
      if (residentId) params.set("residentId", residentId.trim());

      const res = await apiFetch(`/residents/lookup?${params.toString()}`);

      // Support both styles of apiFetch:
      // 1) returns parsed JSON (array)
      // 2) returns Response
      let data: any;
      if (Array.isArray(res)) {
        data = res;
      } else if (res && typeof res === "object" && "ok" in res && typeof (res as Response).json === "function") {
        const r = res as Response;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        data = await r.json();
      } else if (res && typeof res === "object" && "data" in res) {
        // some wrappers return {data: ...}
        data = (res as any).data;
      } else {
        data = res;
      }

      setResults(Array.isArray(data) ? (data as Resident[]) : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-6xl rounded-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Resident Lookup</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="residentId">Resident ID</Label>
              <Input id="residentId" value={residentId} onChange={e => setResidentId(e.target.value)} placeholder="RES-0001" />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="purok">Purok</Label>
              <Input id="purok" value={purok} onChange={e => setPurok(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="barangayHall">Barangay Hall</Label>
              <Input id="barangayHall" value={barangayHall} onChange={e => setBarangayHall(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={doFilter} disabled={!hasAnyFilter || loading} className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Filtering..." : "Filter"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFirstName("");
                setLastName("");
                setPurok("");
                setBarangayHall("");
                setEmail("");
                setResidentId("");
                setResults([]);
                setTouched(false);
              }}
              disabled={loading}
            >
              Clear
            </Button>
            {!hasAnyFilter && touched && (
              <span className="text-sm text-muted-foreground">Enter at least one filter to search.</span>
            )}
          </div>

          {/* Results */}
          <div className="overflow-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3">Resident ID</th>
                  <th className="px-4 py-3">First Name</th>
                  <th className="px-4 py-3">Middle Name</th>
                  <th className="px-4 py-3">Last Name</th>
                  <th className="px-4 py-3">Birth Date</th>
                  <th className="px-4 py-3">House #</th>
                  <th className="px-4 py-3">Street</th>
                  <th className="px-4 py-3">Purok</th>
                  <th className="px-4 py-3">Barangay Hall</th>
                  <th className="px-4 py-3">Civil Status</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Contact Name</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Email Verified</th>
                  <th className="px-4 py-3">Email Address</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={15}>
                      {touched ? "No matching residents found." : "Results will appear here after filtering."}
                    </td>
                  </tr>
                ) : (
                  results.map((r, idx) => (
                    <tr key={`${r.residentId ?? r.email ?? idx}`} className="border-t">
                      <td className="px-4 py-2">{r.residentId ?? "—"}</td>
                      <td className="px-4 py-2">{r.firstName ?? "—"}</td>
                      <td className="px-4 py-2">{r.middleName ?? "—"}</td>
                      <td className="px-4 py-2">{r.lastName ?? "—"}</td>
                      <td className="px-4 py-2">{safeDate(r.birthDate)}</td>
                      <td className="px-4 py-2">{r.houseNumber ?? "—"}</td>
                      <td className="px-4 py-2">{r.street ?? "—"}</td>
                      <td className="px-4 py-2">{r.purok ?? "—"}</td>
                      <td className="px-4 py-2">{r.barangayHall ?? "—"}</td>
                      <td className="px-4 py-2">{r.civilStatus ?? "—"}</td>
                      <td className="px-4 py-2">{r.occupation ?? "—"}</td>
                      <td className="px-4 py-2">{r.contactName ?? "—"}</td>
                      <td className="px-4 py-2">{r.contactPhone ?? "—"}</td>
                      <td className="px-4 py-2">{safeDate(r.registrationDate)}</td>
                      <td className="px-4 py-2">{r.emailVerified ? "Yes" : "No"}</td>
                      <td className="px-4 py-2">{r.email ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
