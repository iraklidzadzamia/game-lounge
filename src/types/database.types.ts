export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            bookings: {
                Row: {
                    id: string
                    station_id: string
                    start_time: string
                    end_time: string
                    customer_name: string
                    customer_phone: string
                    customer_email: string | null
                    total_price: number | null
                    status: string | null
                    created_at: string | null
                    created_by: string | null
                    payment_status: 'paid' | 'unpaid'
                    payment_method: 'cash' | 'card_bog' | 'card_tbc' | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    station_id: string
                    start_time: string
                    end_time: string
                    customer_name: string
                    customer_phone: string
                    customer_email?: string | null
                    total_price?: number | null
                    status?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    payment_status?: 'paid' | 'unpaid'
                    payment_method?: 'cash' | 'card_bog' | 'card_tbc' | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    station_id?: string
                    start_time?: string
                    end_time?: string
                    customer_name?: string
                    customer_phone?: string
                    customer_email?: string | null
                    total_price?: number | null
                    status?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    payment_status?: 'paid' | 'unpaid'
                    payment_method?: 'cash' | 'card_bog' | 'card_tbc' | null
                    notes?: string | null
                }
            }
            stations: {
                Row: {
                    id: string
                    name: string
                    type: string
                    floor: number
                    zone: string | null
                    status: string | null
                    branch_id: string
                }
                Insert: {
                    id: string
                    name: string
                    type: string
                    floor: number
                    zone?: string | null
                    status?: string | null
                    branch_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string
                    floor?: number
                    zone?: string | null
                    status?: string | null
                    branch_id?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    role: 'owner' | 'admin'
                    branch_access: 'all' | 'dinamo' | 'chikovani'
                    created_at: string | null
                }
                Insert: {
                    id: string
                    role: 'owner' | 'admin'
                    branch_access?: 'all' | 'dinamo' | 'chikovani'
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    role?: 'owner' | 'admin'
                    branch_access?: 'all' | 'dinamo' | 'chikovani'
                    created_at?: string | null
                }
            }
        }
    }
}
