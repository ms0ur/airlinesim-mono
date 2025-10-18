import {airportRepo} from '../../repo/airportRepo';


export default defineEventHandler(async (event) => {
    const mode = getRouterParam(event, 'mode')
    if (mode == null) {
        setResponseStatus(event, 400)
        return
    }
    switch (mode) {
        case 'id': {
            const id = getRouterParam(event, 'id')
            if (id == null ) {
                setResponseStatus(event, 400)
                return
            }
            return await airportRepo.findById(id)
        }
        case 'text': {
            const text = getRouterParam(event, 'text')
            const limit = Number(getRouterParam(event, 'limit'))
            const offset = Number(getRouterParam(event, 'offset'))
            if (text == null ) {
                setResponseStatus(event, 400)
                return
            }
            return await airportRepo.find(limit ? limit : 10, offset ? offset : 0, text )

        }
        case 'geoFrom': {
            const latFrom = Number(getRouterParam(event, 'lat'))
            const lngFrom = Number(getRouterParam(event, 'lng'))
            if (latFrom != null && lngFrom != null) {
                setResponseStatus(event, 400)
                return
            }
            const maxRadius = Number(getRouterParam(event, 'maxRadius'))
            const minRadius = Number(getRouterParam(event, 'minRadius'))
            const limit = Number(getRouterParam(event, 'limit'))
            const offset = Number(getRouterParam(event, 'offset'))
            return await airportRepo.findByGeo(latFrom, lngFrom, {
                limit: limit,
                offset: offset,
                maxKm: maxRadius,
                minKm: minRadius,
            })

        }
        default: {
            setResponseStatus(event, 400)
            return;
        }
    }
})