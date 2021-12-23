
// Class for each station on the path
class Station
{
    // setting the passed in stationid, segmentId, name, time
    constructor ( stationId, segmentId, name, time )
    {
        this.name = name;
        this.time = time;
        this.stationId = stationId;
        this.segmentId = segmentId;
    }

    // Getters for fields
    get Name(){
        return this.name;
    }
    get Time(){
        return this.time;
    }
    get StationId(){
        return this.stationId;
    }
    get SegmentId(){
        return this.segmentId;
    }
}