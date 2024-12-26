const BookDetail = () => {

    const id=new URLSearchParams(window.location.search).get('id');

    return(
        <div id={'BookDetail'}>
            Book Detail {id}
        </div>
    );
};

export default BookDetail;