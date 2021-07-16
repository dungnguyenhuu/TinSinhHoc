import React from 'react'

const Sample = (props) => {
    const { sample, onSelect } = props
    const { title, summary, url, source } = sample

    return (
        <div className="sample" onClick={ onSelect }>
            <div className="sample__main">
                <img src="/images/document.png" className="sample__thumbnail" />
                <div className="sample__details">
                    <h4 className="sample__title">{ title }</h4>
                    <p className="sample__summary">{ summary }</p>
                </div>
            </div>

            <div className="sample__footer">
                <a href={ url } target="_blank" className="sample__source"><strong><i className="fas fa-link"></i>&nbsp;&nbsp;Nguồn:</strong> { source }</a>
            </div>
        </div>
    )
}

export default Sample