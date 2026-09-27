import { supabase } from './supabase'
import type { Location, Unit } from './database.types'

export async function getActiveLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getUnitsByLocation(locationId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('location_id', locationId)
    .order('price')

  if (error) throw error
  return data ?? []
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
