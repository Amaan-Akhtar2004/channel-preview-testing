"use client";

import { useState, useEffect } from "react";
import AddPermalink from "../components/AddPermalink";
import SocialMediaFormComponent from "../components/SocialMediaFormComponent";
import EditChannelSetupComponent from "../components/EditChannelSetup";
import { getChannels } from "../utils/getchannel";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const fetchChannels = async () => {
    const fetchedChannels = await getChannels();
    console.log(fetchedChannels);
    setChannels(fetchedChannels);
  };
  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSocialMediaSubmit = async (formData) => {
    const response = await fetch('/api/socialmedia/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      return { status: 'success', message: 'Form submitted successfully' };
    } else if (response.status === 409) {
      return { status: 'error', message: 'Channel already exists' };
    } else {
      const errorData = await response.json();
      return { status: 'error', message: errorData.message || 'Form submission failed' };
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Channel Preview Testing
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Add New Permalink</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AddPermalink channels={channels} />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Add Social Media Channel</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SocialMediaFormComponent onSubmit={handleSocialMediaSubmit} fetchChannels={fetchChannels} />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Edit Channel Setup</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <EditChannelSetupComponent channelNames={channels} fetchChannels = {fetchChannels} />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}
