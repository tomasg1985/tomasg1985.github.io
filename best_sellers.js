(() => {
    const track = document.getElementById('recommended-products-carousel');
    const previousButton = document.getElementById('recommendations-prev');
    const nextButton = document.getElementById('recommendations-next');

    if (!track || !previousButton || !nextButton) return;

    track.querySelectorAll('.product_card_container .purchase').forEach(detailLink => {
        detailLink.addEventListener('click', () => {
            const card = detailLink.closest('.product_card_container');
            const image = card.querySelector('.picture');
            const title = card.querySelector('.product_name').textContent.trim();
            const price = Number(card.querySelector('.single_product_price').textContent.replace(/\D/g, ''));

            sessionStorage.setItem('selectedRecommendationProduct', JSON.stringify({
                id: Number(detailLink.dataset.productId),
                title,
                price,
                image: image.getAttribute('src'),
                category: card.querySelector('.product_seller').textContent.trim(),
                description: `${title} recomendado por TecnoStore.`
            }));
        });
    });

    const updateButtons = () => {
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        const hasOverflow = maxScrollLeft > 1;

        previousButton.hidden = !hasOverflow;
        nextButton.hidden = !hasOverflow;
        previousButton.disabled = track.scrollLeft <= 1;
        nextButton.disabled = track.scrollLeft >= maxScrollLeft - 1;
    };

    previousButton.addEventListener('click', () => {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });

    nextButton.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
})();
