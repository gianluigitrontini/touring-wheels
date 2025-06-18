// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent to extract relevant points along a GPX route for weather information.
 *
 * - extractRelevantWeatherPoints - A function that extracts relevant weather points along a route.
 * - ExtractRelevantWeatherPointsInput - The input type for the extractRelevantWeatherPoints function.
 * - ExtractRelevantWeatherPointsOutput - The return type for the extractRelevantWeatherPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GpxDataSchema = z.string().describe('GPX data in string format.');
const ExtractRelevantWeatherPointsInputSchema = z.object({
  gpxData: GpxDataSchema,
  tripDescription: z
    .string()
    .optional()
    .describe('A description of the planned trip, including dates, locations, and activities.'),
});
export type ExtractRelevantWeatherPointsInput = z.infer<typeof ExtractRelevantWeatherPointsInputSchema>;

const WaypointSchema = z.object({
  latitude: z.number().describe('Latitude of the waypoint.'),
  longitude: z.number().describe('Longitude of the waypoint.'),
  reason: z.string().describe('The reason this waypoint was selected for weather information.'),
});

const ExtractRelevantWeatherPointsOutputSchema = z.array(WaypointSchema).describe(
  'An array of GPS coordinates (latitude and longitude) representing the most relevant points along the route to display weather information, along with the reasoning for its selection.'
);
export type ExtractRelevantWeatherPointsOutput = z.infer<typeof ExtractRelevantWeatherPointsOutputSchema>;

export async function extractRelevantWeatherPoints(
  input: ExtractRelevantWeatherPointsInput
): Promise<ExtractRelevantWeatherPointsOutput> {
  return extractRelevantWeatherPointsFlow(input);
}

const extractRelevantWeatherPointsPrompt = ai.definePrompt({
  name: 'extractRelevantWeatherPointsPrompt',
  input: {
    schema: ExtractRelevantWeatherPointsInputSchema,
  },
  output: {
    schema: ExtractRelevantWeatherPointsOutputSchema,
  },
  prompt: `You are a trip planning assistant that helps cyclists plan bicycle trips that are one week or longer.

  Given a GPX file representing a bicycle route, identify the most relevant points along the route to display weather information.
  These points should include:
  - Campsites or planned stopping points
  - Areas with significant elevation changes
  - Points that represent major changes in direction or location
  - Points that are at regular intervals to provide a comprehensive overview

  Consider the provided trip description when selecting points. Prioritize points that align with the user's planned activities and locations.

  GPX Data:
  {{gpxData}}

  Trip Description:
  {{tripDescription}}

  Return an array of GPS coordinates (latitude and longitude) representing the most relevant points along the route to display weather information.  Include the reasoning for each point in the reason field.

  Output the response as a JSON array.
  `,
});

const extractRelevantWeatherPointsFlow = ai.defineFlow(
  {
    name: 'extractRelevantWeatherPointsFlow',
    inputSchema: ExtractRelevantWeatherPointsInputSchema,
    outputSchema: ExtractRelevantWeatherPointsOutputSchema,
  },
  async input => {
    const {output} = await extractRelevantWeatherPointsPrompt(input);
    return output!;
  }
);
