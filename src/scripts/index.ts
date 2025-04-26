/** Our main application class, extend this as needed. */

import '../styles/card.scss';

class Main {

  private getMemberIdFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  constructor() {

    const memberId = this.getMemberIdFromUrl();
    if (memberId) {
      this.fetchMemberData(memberId);
    } else {
      console.error('No member ID found in URL');
    }
  }

  // Fetches data for member from the parliament API
  private async fetchMemberData(memberId: string): Promise<void> {
    try {
      const response = await fetch(`https://members-api.parliament.uk/api/Members/${memberId}`);
      const json = await response.json();
      const data = json.value
      // Extract the data from API response
      const name = data.nameDisplayAs;
      const party = data.latestParty.name;
      const constituency = data.latestHouseMembership.membershipFrom;
      const endDate = data.latestHouseMembership.membershipEndDate;
      const imageUrl = data.thumbnailUrl;
      const partyColour = `#${data.latestParty.backgroundColour}`; //  convert to #

      // Render the card with the extracted data
      this.renderCard({
        name,
        party,
        constituency,
        imageUrl,
        membershipEndDate: endDate,
        partyColour
      });

    } catch (error) {
      console.error('Failed to fetch member data:', error);
    }
  }

  // Renders the member card into the container on the browser page
  private renderCard(data: {
    name: string;
    party: string;
    constituency: string;
    imageUrl: string;
    membershipEndDate: string | null;
    partyColour: string;
  }): void {
    const container = document.getElementById('card-container');
    if (!container) return;

    const card = this.createCard({
      name: data.name,
      party: data.party,
      constituency: data.constituency,
      imageUrl: data.imageUrl,
      endDate: data.membershipEndDate,
      partyColour: data.partyColour
    });

    // Clear the existing content and append the new card
    container.innerHTML = ''; 
    container.appendChild(card);
  }

  // Creates a DOM element for the member card and returns HTML element
  private createCard(data: {
    party: string;
    name: string;
    constituency: string;
    imageUrl: string;
    endDate: string;
    partyColour: string;
  }): HTMLElement {
    const card = document.createElement('div')
    card.className = 'card';

    // Check is the member is no longer serving and return the text if so
    const isNoLongerServing = data.endDate !== null && new Date(data.endDate).getTime() < new Date().getTime();

    const noLongerText = isNoLongerServing ? `<div class="no-longer-wrapper">
    <div class="no-longer">No longer serving</div>
    </div>` : '';

    // Construct inner HTML for card
    card.innerHTML = `
      <div class="card-content">
        <div class="card-image-wrapper">
          <img src=${data.imageUrl} alt="" class="card-image" style="border-color: ${data.partyColour}"/>
        </div>
        <div class = 'card-text'>
          <div class="party">${data.party}</div>
          <div class="name">${data.name}</div>
          <div class="constituency">${data.constituency}</div>
          ${noLongerText}
        </div>
      </div> `;
    return card;
  }

}

new Main();
